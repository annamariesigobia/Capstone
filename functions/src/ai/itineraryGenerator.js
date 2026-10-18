const { onCall, HttpsError } = require("firebase-functions/v2/https");
const OpenAI = require("openai");

exports.itineraryGenerator = onCall(async (request) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY is missing on functions environment.");
  }

  const { duration, budget, interests } = request.data;
  const openai = new OpenAI({ apiKey });

  try {
    const prompt = `Create a ${duration}-day Dinagat Islands itinerary. Budget constraint: ₱${budget}. Primary interests: ${interests.join(', ')}. Return ONLY a JSON object matching this exact shape:
    {
      "title": "Itinerary Title",
      "duration": ${duration},
      "estimatedCost": ${budget},
      "attractions": ["attractionName1", "attractionName2"],
      "days": {
        "day1": ["activity1", "activity2"],
        "day2": ["activity1", "activity2"]
      }
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a professional travel planner specializing in Dinagat Islands. Only output valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI itinerary generator error:", error);
    throw new HttpsError("internal", "Itinerary planning compilation failed.");
  }
});
