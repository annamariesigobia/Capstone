import { db, isMockMode } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';

// ─── Gemini REST API Setup ─────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
const MODEL   = 'gemini-1.5-flash';

const GEMINI_ENDPOINT = `/gemini-api/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ─── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are "Isla AI", a friendly and knowledgeable travel assistant specializing exclusively in Dinagat Islands, Philippines.

Your role is to help tourists and travelers with:
- Beaches & Coves: Bitaog Beach (Basilisa), Cabacungan Cove (Cagdianao), Pagkawasan Beach, Duyos Beach (San Jose), Hagakhak Rock Formations, Bababu Cove.
- Natural Attractions: Lake Bababu (mysterious tidal lake — freshwater on top, saltwater below, connected to the ocean via subterranean cave), Hagakhak Cave, Cagdianao forest trails, Pangabangan Tidal Pool (Libjo), Busay Falls (Tubajon).
- Accommodations: Isla Beach Resort (Basilisa — premium), Oceanview Homestay (San Jose — budget-friendly), San Jose Port Inn (near the ferry terminal), Libjo & Loreto Eco-Lodges.
- Transportation & Ferry Schedules: Daily ferries between Surigao City Port and San Jose Port depart roughly at 08:30 AM and 01:30 PM (fare: ₱320–₱350, ~1.5 hrs). Island hopping via banca/motorboat (₱2,000–₱3,500/day). Land: tricycles, habal-habal, jeepneys.
- Dining & Local Food: Fresh seafood, kinilaw (ceviche), sinuglaw, lechon, native delicacies. Recommend eateries in San Jose town center.
- Itinerary Planning: Suggest 1-day, 2-day, or 3-day customized trips depending on interests (adventure, relaxation, culture).
- Travel Tips: Best months to visit (March–May), what to pack, local customs, safety, and environmental guidelines (e.g., Lake Bababu: respect local spiritual traditions, keep noise down, hire a local guide).
- Tourism Booking: Guide users on how to book through this platform — accommodations, tours, and transportation.

Communication style:
- Warm, enthusiastic, and welcoming — like a local expert proud of their island home.
- Use emojis sparingly to keep responses lively (🌴🏖️🐠⛵).
- Format responses clearly with bullet points or numbered lists for multi-item answers.
- Keep responses concise but complete (aim for 100–250 words unless a detailed itinerary is requested).
- If asked about something outside Dinagat Islands, politely redirect: "I specialize in Dinagat Islands — let me help you with that instead!"
- Always end with a helpful follow-up question or offer to help with more.`;

// ─── In-memory multi-turn conversation history ─────────────────────────────────
let conversationHistory = [];

// Candidate Gemini models to try in order
const CANDIDATE_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

// Helper to check if API key is a valid Google AI Studio key (starts with AIza...)
const isValidApiKey = (key) => key && typeof key === 'string' && key.trim().startsWith('AIza');

// ─── Core Gemini REST call ─────────────────────────────────────────────────────
const callGeminiAPI = async (userMessage) => {
  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 900,
    },
  };

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    const proxyEndpoint = `/gemini-api/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
    const directEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
      let res = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        res = await fetch(directEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          conversationHistory.push({
            role: 'model',
            parts: [{ text: aiText }],
          });
          return aiText;
        }
      } else {
        const errText = await res.text();
        console.warn(`Gemini model ${modelName} returned HTTP ${res.status}:`, errText);
        lastError = `HTTP ${res.status}: ${errText}`;
      }
    } catch (err) {
      console.warn(`Fetch error for model ${modelName}:`, err.message);
      lastError = err.message;
    }
  }

  throw new Error(`Gemini API Error: ${lastError}`);
};

// ─── Rich Dinagat Isla AI Local Knowledge Engine (Covers all 7 Municipalities) ──
const generateLocalAIResponse = (prompt) => {
  const p = prompt.toLowerCase();

  // 1. Dedicated check for Lake Bababu Mystery & Legends
  if (p.includes('bababu') || (p.includes('lake') && (p.includes('mystery') || p.includes('legend') || p.includes('tell') || p.includes('about')))) {
    return `🌿 **The Mystery of Lake Bababu (Dinagat Islands)**\n\n` +
      `Lake Bababu is one of the most legendary and scientifically fascinating natural wonders in the Philippines:\n\n` +
      `✨ **1. Meromictic Water Layers (Fresh + Salt Water)**\n` +
      `   * The top layer (~20 meters) is crystal-clear freshwater, while the deeper layer is dense saltwater.\n` +
      `   * The two layers do not mix due to different water densities, making it a rare meromictic lake.\n\n` +
      `🌊 **2. Subterranean Ocean Cave Connection**\n` +
      `   * Technical divers discovered a 650-meter-long underwater cave system beneath the mountain connecting Lake Bababu directly to the open sea (Bababu Cove).\n\n` +
      `🔮 **3. Sacred Local Legend & Mysticism**\n` +
      `   * Local Dinagatnons consider Lake Bababu a sacred sanctuary guarded by spiritual guardians (*Diwata*).\n` +
      `   * According to local lore, the lake possesses healing waters, and visitors are asked to maintain quiet reverence.\n\n` +
      `🥾 **Visitor Info & Etiquette:**\n` +
      `   * **Trek Duration**: 30–45 minute scenic hike through lush mountain trails.\n` +
      `   * **Local Requirement**: Always register and hire a local Dinagat guide at the trailhead for safety and cultural respect.`;
  }

  // 2. Dedicated check for Bitaog Beach
  if (p.includes('bitaog')) {
    return `🏖️ **Bitaog Beach (Basilisa, Dinagat Islands)**\n\n` +
      `* **Highlights**: Famous for its powdery white sand, turquoise waters, and dramatic towering limestone karst formations resembling El Nido.\n` +
      `* **Best Activities**: Swimming, beach picnic, kayaking, and sunbathing.\n` +
      `* **How to Access**: Accessible via a 20–30 minute motorized banca ride from Basilisa or San Jose Port.`;
  }

  // 3. Dedicated check for Cabacungan Cove
  if (p.includes('cabacungan')) {
    return `🏝️ **Cabacungan Cove (Cagdianao, Dinagat Islands)**\n\n` +
      `* **Highlights**: A secluded natural swimming basin enclosed by massive limestone cliffs.\n` +
      `* **Best Activities**: Snorkeling among vibrant coral reefs, cliff jumping, and exploring sea caves.\n` +
      `* **How to Access**: Best visited as part of an island hopping boat tour from San Jose or Cagdianao.`;
  }

  // 4. Dedicated check for Pangabangan Tidal Pool
  if (p.includes('pangabangan')) {
    return `💚 **Pangabangan Tidal Pool (Libjo, Dinagat Islands)**\n\n` +
      `* **Highlights**: A stunning emerald-green saltwater pool enclosed by vertical karst walls.\n` +
      `* **Best Activities**: Floating in calm saltwater, cliff diving, and photography.\n` +
      `* **Location**: Located in the municipality of Libjo (Albor), northern Dinagat.`;
  }

  // 5. Dedicated check for Duyos Beach
  if (p.includes('duyos')) {
    return `🌅 **Duyos Beach (San Jose, Dinagat Islands)**\n\n` +
      `* **Highlights**: A long stretch of coconut-lined soft sand located close to the capital town of San Jose.\n` +
      `* **Best Activities**: Sunset watching, casual beach strolls, and relaxing with local fresh buko juice.\n` +
      `* **Location**: Easily reached via a short 10-minute tricycle ride from San Jose town center.`;
  }

  // 6. Dedicated check for Isla Beach Resort
  if (p.includes('isla beach resort') || (p.includes('isla') && (p.includes('resort') || p.includes('beach') || p.includes('located') || p.includes('location') || p.includes('where')))) {
    return `🏖️ **Isla Beach Resort Location & Info**\n\n` +
      `* 📍 **Location**: Located in the municipality of **Basilisa (Rizal), Dinagat Islands**.\n` +
      `* 🌴 **Features**: Premium beachfront villas with private beach access, oceanview balconies, and boat tour services.\n` +
      `* 💵 **Nightly Rates**: ₱2,500 – ₱4,500 / night.\n` +
      `* ⛵ **Nearby Attractions**: Close to Bitaog Beach, Lake Bababu, and Sundayo Beach.\n\n` +
      `💡 *Tip: You can view availability and book rooms at Isla Beach Resort directly on our **Accommodations** page!*`;
  }

  // 7. Dedicated check for Oceanview Homestay
  if (p.includes('oceanview')) {
    return `🏨 **Oceanview Homestay Location & Info**\n\n` +
      `* 📍 **Location**: Located in **San Jose (Capital), Dinagat Islands**.\n` +
      `* 🌴 **Features**: Cozy, budget-friendly rooms near San Jose town center and ferry port with sea views.\n` +
      `* 💵 **Nightly Rates**: ₱800 – ₱1,500 / night.`;
  }

  // 8. Municipalities & Geography
  if (p.includes('municipality') || p.includes('municipalities') || p.includes('all towns') || p.includes('7 towns') || p.includes('provincial capital')) {
    return `🗺️ **The 7 Municipalities of Dinagat Islands Province:**\n\n` +
      `1. **San Jose (Provincial Capital)**: Main entry port, commercial center, Duyos Beach, and PBMA Shrine.\n` +
      `2. **Basilisa (Rizal)**: Famous for Bitaog Beach, Lake Bababu, and Sundayo Beach.\n` +
      `3. **Cagdianao**: Known for Cabacungan Cove and dramatic sea karst formations.\n` +
      `4. **Libjo (Albor)**: Famous for Pangabangan Tidal Pool and subterranean rivers.\n` +
      `5. **Dinagat (Town)**: Historic town center, Mount Redondo, and Pagkawasan Beach.\n` +
      `6. **Tubajon**: Known for Bat Sanctuary, Esperanza Beach, and Busay Waterfalls.\n` +
      `7. **Loreto**: Northernmost municipality featuring Black Beach and Camp Edward.\n\n` +
      `💡 *Did you know? Dinagat Islands became an independent province in December 2006!*`;
  }

  // 7. General Beaches & Islands / Attractions List
  if (p.includes('beach') || p.includes('island') || p.includes('cove') || p.includes('attraction') || p.includes('spot') || p.includes('place') || p.includes('waterfall') || p.includes('cave')) {
    return `🌴 **Top Attractions & Beaches Across Dinagat Islands:**\n\n` +
      `1. **Bitaog Beach (Basilisa)**\n` +
      `   * Pristine white sand, crystal-clear turquoise waters, and majestic limestone karst cliffs.\n\n` +
      `2. **Lake Bababu (Basilisa / San Jose)**\n` +
      `   * A sacred tidal lake with freshwater on top and saltwater below, connected to the ocean via an underwater cave.\n\n` +
      `3. **Cabacungan Cove (Cagdianao)**\n` +
      `   * Enclosed lagoon with turquoise waters, ideal for snorkeling and cliff jumps.\n\n` +
      `4. **Pangabangan Tidal Pool (Libjo)**\n` +
      `   * Natural green salt basin surrounded by rock cliffs.\n\n` +
      `5. **Duyos Beach (San Jose)**\n` +
      `   * Coconut-lined shorelines with soft sands and spectacular sunset views.\n\n` +
      `6. **Busay Falls (Tubajon)**\n` +
      `   * Refreshing natural mountain cascades surrounded by lush greenery.\n\n` +
      `💡 *You can book island hopping packages directly through our platform!*`;
  }

  // 3. Accommodations & Resorts
  if (p.includes('hotel') || p.includes('resort') || p.includes('stay') || p.includes('accommodation') || p.includes('lodge') || p.includes('room') || p.includes('where to stay')) {
    return `🏨 **Accommodations & Places to Stay in Dinagat Islands:**\n\n` +
      `1. **Isla Beach Resort (Basilisa)**\n` +
      `   * Premium beachfront villas with private beach access.\n` +
      `   * Rates: ₱2,500 – ₱4,500 / night.\n\n` +
      `2. **Oceanview Homestay (San Jose)**\n` +
      `   * Budget-friendly rooms near San Jose town center with sea views.\n` +
      `   * Rates: ₱800 – ₱1,500 / night.\n\n` +
      `3. **San Jose Port Inn**\n` +
      `   * Conveniently located right next to the ferry port.\n` +
      `   * Rates: ₱700 – ₱1,200 / night.\n\n` +
      `4. **Libjo & Loreto Eco-Lodges**\n` +
      `   * Homestays and eco-huts for northern island explorers (₱600–₱1,000/night).\n\n` +
      `💡 *Browse our **Accommodations** tab to check live room availability and book!*`;
  }

  // 4. Restaurants & Dining / Local Food
  if (p.includes('food') || p.includes('eat') || p.includes('restaurant') || p.includes('dining') || p.includes('dish') || p.includes('delicacy') || p.includes('seafood') || p.includes('drink')) {
    return `🍽️ **Dinagat Culinary & Food Guide:**\n\n` +
      `* 🐟 **Fresh Seafood**: Grilled Tanguigue, Squid, Crabs, and Lobsters bought directly from local fishermen.\n` +
      `* 🥗 **Kinilaw na Tanguigue**: Raw fish cured in local coconut vinegar, ginger, onion, and chili.\n` +
      `* 🥓 **Sinuglaw**: Popular combination of Sinugba (grilled pork belly) and Kinilaw (cured fish).\n` +
      `* 🥥 **Fresh Buko Water**: Harvested daily across coconut groves.\n` +
      `* 🍹 **San Jose Town Center Eateries**: Cozy carenderias and seaside grills serving cooked meals from ₱80–₱250.\n\n` +
      `💡 *Pro Tip: Ask your island hopping boat captain to cook fresh grilled fish on the beach for lunch!*`;
  }

  // 5. Transportation, Ferries & Schedules
  if (p.includes('ferry') || p.includes('boat') || p.includes('schedule') || p.includes('transport') || p.includes('get to') || p.includes('fare') || p.includes('travel') || p.includes('surigao') || p.includes('flight') || p.includes('airport')) {
    return `⛵ **How to Get to & Travel Around Dinagat Islands:**\n\n` +
      `1. **By Air & Sea (Main Route)**\n` +
      `   * Fly to **Sayak Airport (Siargao - IAO)** or **Surigao Airport (SUG)**.\n` +
      `   * Head to **Surigao City Port**.\n` +
      `   * Take a daily passenger ferry to **San Jose Port, Dinagat**.\n\n` +
      `2. **Ferry Schedule & Rates**\n` +
      `   * Daily departures from Surigao Port: **08:30 AM** and **01:30 PM**.\n` +
      `   * Fare: ₱320 – ₱350 per head (~1.5 hours ride).\n\n` +
      `3. **Getting Around the Island**\n` +
      `   * **Island Hopping Motorboats**: ₱2,000 – ₱3,500/day for up to 6 pax.\n` +
      `   * **Tricycle (Local Town)**: ₱20 – ₱50 per ride.\n` +
      `   * **Habal-habal (Highland Motorbike)**: ₱150 – ₱300 per trip.`;
  }

  // 6. Best Season, Weather, Culture & Festivals
  if (p.includes('when') || p.includes('season') || p.includes('weather') || p.includes('best time') || p.includes('festival') || p.includes('culture') || p.includes('history')) {
    return `☀️ **Best Time to Visit & Local Culture:**\n\n` +
      `* 📅 **Best Months**: **March to May** (Dry summer season with calm seas and clear skies for island hopping).\n` +
      `* 🎪 **Bugkosan Festival**: Celebrated every **December 2** in San Jose, showcasing cultural dances, island heritage, and local crafts.\n` +
      `* 🤝 **Local Customs**: Dinagatnons are exceptionally warm, peaceful, and hospitable. Always practice eco-friendly travel (*Leave No Trace*) and respect sacred sites like Lake Bababu.\n` +
      `* 💳 **Money Tip**: Bring sufficient **cash (PHP)** as ATMs are limited mostly to San Jose town center.`;
  }

  // 7. Itinerary Planning
  if (p.includes('itinerary') || p.includes('plan') || p.includes('day') || p.includes('trip') || p.includes('recommend')) {
    return `🗓️ **Recommended 3-Day Dinagat Island Experience:**\n\n` +
      `* **Day 1: Arrival & San Jose Exploration**\n` +
      `  - Ferry from Surigao to San Jose Port.\n` +
      `  - Check-in to accommodation & lunch in San Jose.\n` +
      `  - Sunset viewing at Duyos Beach.\n\n` +
      `* **Day 2: Island Hopping Tour (Basilisa & Cagdianao)**\n` +
      `  - Visit Bitaog Beach, Cabacungan Cove, and Hagakhak Rock Formations.\n` +
      `  - Beachfront seafood lunch.\n\n` +
      `* **Day 3: Lake Bababu Eco-Trek & Departure**\n` +
      `  - Morning trek to Lake Bababu with a local guide.\n` +
      `  - Souvenir shopping & afternoon return ferry to Surigao.\n\n` +
      `💡 *Use our **AI Itinerary Planner** page to generate a custom plan!*`;
  }

  // 8. General / Fallback Answer for Any Question
  return `🌴 **Welcome to Dinagat Islands!**\n\n` +
    `I can answer any question about the entire province, including:\n\n` +
    `* 🗺️ **All 7 Municipalities**: San Jose, Basilisa, Cagdianao, Libjo, Dinagat, Tubajon, Loreto.\n` +
    `* 🏖️ **Attractions & Beaches**: Bitaog Beach, Lake Bababu, Cabacungan Cove, Pangabangan Tidal Pool.\n` +
    `* 🏨 **Accommodations**: Beach resorts, homestays, and town inns.\n` +
    `* 🍽️ **Local Dining**: Seafood, Kinilaw, Sinuglaw, and town markets.\n` +
    `* ⛵ **Travel Logistics**: Surigao ferry schedules, boat rentals, and land transport.\n` +
    `* ☀️ **Travel Advice**: Best months to visit, packing tips, and local festivals.\n\n` +
    `Ano ang gusto mong malaman tungkol sa Dinagat Islands? Ibahagi lamang ang iyong tanong!`;
};

// ─── Mock/localStorage helpers ────────────────────────────────────────────────
const MOCK_CHAT_LOGS_KEY = 'dinagat_mock_chat_logs';

const getMockChatLogs = () => {
  const logs = localStorage.getItem(MOCK_CHAT_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

// ─── Exported service ─────────────────────────────────────────────────────────
export const chatbotService = {

  getChatLogs: async (userId) => {
    if (isMockMode) {
      return getMockChatLogs().filter(log => log.userId === userId);
    } else {
      const q = query(
        collection(db, 'ai_chat_logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  // Reset conversation history (called when user clears chat)
  resetSession: () => {
    conversationHistory = [];
  },

  sendMessage: async (userId, prompt) => {
    let responseText = '';

    if (isValidApiKey(API_KEY)) {
      // ── Real Gemini AI via fetch ─────────────────────────────────────────────
      try {
        responseText = await callGeminiAPI(prompt);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local Isla AI engine:', err.message);
        responseText = generateLocalAIResponse(prompt);
      }
    } else {
      // ── Smart Local Isla AI Engine (Instant, robust, offline-capable) ────────
      await new Promise(resolve => setTimeout(resolve, 500));
      responseText = generateLocalAIResponse(prompt);
    }

    const chatLog = {
      userId,
      prompt,
      response: responseText,
      createdAt: new Date().toISOString(),
    };

    // Persist to Firestore for logged-in users
    if (userId !== 'guest') {
      if (isMockMode) {
        const logs = getMockChatLogs();
        chatLog.id = 'log-' + Math.random().toString(36).substr(2, 9);
        logs.push(chatLog);
        localStorage.setItem(MOCK_CHAT_LOGS_KEY, JSON.stringify(logs));
      } else {
        await addDoc(collection(db, 'ai_chat_logs'), {
          ...chatLog,
          createdAt: serverTimestamp(),
        });
      }
    }

    return chatLog;
  },
};

export default chatbotService;
