const { onCall, HttpsError } = require("firebase-functions/v2/https");
const OpenAI = require("openai");

exports.travelAssistant = onCall(async (request) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY is not configured on Cloud Functions.");
  }

  const openai = new OpenAI({ apiKey });
  const message = request.data.message;

  if (!message) {
    throw new HttpsError("invalid-argument", "The prompt message is required.");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a warm, helpful tourism assistant for Dinagat Islands. Guide tourists on tourist spots like Bitaog Beach, Hagakhak Rocks, Lake Bababu, ferry routes, homestays, and packing advice."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return {
      answer: response.choices[0].message.content
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new HttpsError("internal", "AI assistant request failed.");
  }
});
