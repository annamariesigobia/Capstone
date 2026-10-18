import { db, isMockMode } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';

const MOCK_ITINERARIES_KEY = 'dinagat_mock_itineraries';

const getMockItineraries = () => {
  const items = localStorage.getItem(MOCK_ITINERARIES_KEY);
  if (!items) {
    const list = [
      {
        id: 'itin-1',
        touristId: 'mock-tourist-uid',
        title: 'My Beach Escape to Dinagat',
        duration: 3,
        estimatedCost: 8000,
        attractions: ['Bitaog Beach', 'Lake Bababu', 'Hagakhak Rock Formations'],
        generatedByAI: true,
        days: {
          day1: ['Ferry departure from Surigao Port', 'Arrival at San Jose Terminal', 'Check in to Isla Beach Resort', 'Sunset drinks at Duyos Beach'],
          day2: ['Boat tour to Hagakhak Rock Formations', 'Snorkeling at Bitaog Beach', 'Picnic lunch on the white sands'],
          day3: ['Hike up the sacred trail to Lake Bababu', 'Trek back to the cove', 'Ferry return back to Surigao']
        },
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(MOCK_ITINERARIES_KEY, JSON.stringify(list));
    return list;
  }
  return JSON.parse(items);
};

export const itineraryService = {

  getItineraries: async (touristId) => {
    const list = getMockItineraries();
    const localList = list.filter(it => String(it.touristId) === String(touristId));

    if (isMockMode) {
      return localList;
    } else {
      try {
        const q = query(collection(db, 'itineraries'), where('touristId', '==', String(touristId)));
        const snap = await getDocs(q);
        const remoteList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const combined = [...remoteList];
        localList.forEach(localItem => {
          const exists = combined.some(
            r => r.id === localItem.id || (r.title === localItem.title && String(r.duration) === String(localItem.duration))
          );
          if (!exists) {
            combined.push(localItem);
          }
        });
        return combined;
      } catch (err) {
        console.warn("Firestore getItineraries error, returning local saved list fallback:", err);
        return localList;
      }
    }
  },

  saveItinerary: async (itineraryData) => {
    const cleanData = {
      ...itineraryData,
      touristId: String(itineraryData.touristId)
    };

    const newItin = {
      id: 'itin-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...cleanData
    };

    // Always keep local storage updated so it works offline/in mock sessions
    const list = getMockItineraries();
    list.push(newItin);
    localStorage.setItem(MOCK_ITINERARIES_KEY, JSON.stringify(list));

    if (!isMockMode) {
      try {
        const docRef = await addDoc(collection(db, 'itineraries'), {
          ...cleanData,
          createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...cleanData };
      } catch (err) {
        console.warn("Firestore saveItinerary error, saved locally as fallback:", err);
        return newItin;
      }
    }
    return newItin;
  },

  deleteItinerary: async (id) => {
    const list = getMockItineraries();
    const filtered = list.filter(it => it.id !== id);
    localStorage.setItem(MOCK_ITINERARIES_KEY, JSON.stringify(filtered));

    if (!isMockMode) {
      try {
        const docRef = doc(db, 'itineraries', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn("Firestore deleteItinerary error:", err);
      }
    }
    return true;
  },

  setPendingItinerary: (itinerary) => {
    try {
      sessionStorage.setItem('pending_ai_itinerary', JSON.stringify(itinerary));
    } catch (e) {}
  },

  getPendingItinerary: () => {
    try {
      const raw = sessionStorage.getItem('pending_ai_itinerary');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  clearPendingItinerary: () => {
    try {
      sessionStorage.removeItem('pending_ai_itinerary');
    } catch (e) {}
  },

  processPendingItinerary: async (touristId) => {
    try {
      const raw = sessionStorage.getItem('pending_ai_itinerary');
      if (raw) {
        const pending = JSON.parse(raw);
        sessionStorage.removeItem('pending_ai_itinerary');
        const itineraryToSave = {
          touristId: String(touristId),
          title: pending.title,
          duration: pending.duration,
          estimatedCost: pending.estimatedCost,
          attractions: pending.attractions,
          days: pending.days,
          generatedByAI: true
        };
        const saved = await itineraryService.saveItinerary(itineraryToSave);
        return saved;
      }
    } catch (e) {
      console.error("Failed processing pending itinerary", e);
    }
    return null;
  },

  generateAIItinerary: async (duration, budget, interests) => {

    await new Promise(resolve => setTimeout(resolve, 1500));

    const days = {};
    const attractions = [];

    if (interests.includes('Beaches')) {
      attractions.push('Bitaog Beach', 'Duyos Beach');
    }
    if (interests.includes('Nature')) {
      attractions.push('Lake Bababu');
    }
    if (interests.includes('Adventure')) {
      attractions.push('Hagakhak Rock Formations', 'Cabacungan Cove');
    }

    if (attractions.length === 0) {
      attractions.push('Bitaog Beach', 'Lake Bababu');
    }

    for (let d = 1; d <= duration; d++) {
      if (d === 1) {
        days[`day${d}`] = [
          'Arrival at Dinagat Islands via Ferry from Surigao Port',
          `Check-in to selected island accommodation`,
          `Welcome walk around San Jose and local town landmarks`,
          `Evening dinner and sunset viewing at Duyos Beach`
        ];
      } else if (d === duration) {
        days[`day${d}`] = [
          `Morning pack-up and souvenir shopping in San Jose center`,
          `Visit local tourism office for history display`,
          `Board afternoon ferry back to Surigao mainland`
        ];
      } else {

        const activity1 = attractions[0] ? `Full morning excursion exploring the waters of ${attractions[0]}` : 'Island hopping boat cruise';
        const activity2 = attractions[1] ? `Hiking tour or picnic lunch near ${attractions[1]}` : 'Snorkeling safari around nearby islets';
        days[`day${d}`] = [
          activity1,
          `Traditional seafood lunch served on-site by local guides`,
          activity2,
          `Return to resort, relaxation and seafood dinner at local restaurant`
        ];
      }
    }

    return {
      title: `AI Recommended ${duration}-Day Itinerary (${interests.join(', ')})`,
      duration: Number(duration),
      estimatedCost: Number(budget),
      attractions,
      days,
      generatedByAI: true
    };
  }
};

export default itineraryService;
