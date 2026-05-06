import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mood, sampleCards } = req.body;

  // Uses the specific GROQ_API_KEY_2 mandated by you.
  // Note: If you don't have it set locally yet, make sure to add it to .env.local!
  const apiKey = process.env.GROQ_API_KEY_2 || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY_2" });
  }

  const groq = new Groq({ apiKey });

  // Note: "openai/gpt-oss-120b" is not natively hosted on Groq. 
  // Groq's top tier model for complex formatting and anti-AI is `llama-3.3-70b-versatile`.
  // If you use a proxy/openrouter, swap this out!
  const MODEL_NAME = "llama-3.3-70b-versatile"; 

  // Format samples for the prompt
  const samplesText = sampleCards && sampleCards.length > 0 
    ? sampleCards.map(c => `[VOICE: ${c.voice}]\nText: ${c.text}`).join("\n\n")
    : "No samples provided.";

  const SYSTEM_PROMPT = `You are the "Living Library Engine" representing Asif.
Your task is to generate exactly 8 new, unique affirmations for the mood/bucket: "${mood?.toUpperCase() || "NEUTRAL"}".
You must PERFECTLY mimic Asif's texting cadence based on the provided samples.
You must distribute the 8 affirmations across the available voices (soft, hype, deep, asif_drop).

STRICT ANTI-AI CONSTRAINTS (CRITICAL! DO NOT FAIL THESE):
1. Max ONE COMMA per single affirmation response. Zero is even better.
2. Questions everywhere! Genuine questions. Give her pause. Let her think.
3. Emojis ONLY in the 'hype' voice, and max ONE emoji per affirmation. Never use them decoratively.
4. NEVER start any affirmation with "You are" or "You're".
5. Every single affirmation must have ONE specific micro-detail (e.g., the way a shadow falls, the sound of an exhale, a chipped nail).
6. At least 30% of the affirmations MUST trail off without a period at the end.
7. FORBIDDEN WORDS (NEVER USE THESE): radiant, resilient, worthy, valid, enough, journey, healing, space, energy, manifest.
8. Do not use generic AI platitudes.

Provided Sample Cards to mimic cadence:
${samplesText}

You must respond ONLY with a valid JSON object containing an "affirmations" array.
Each object in the array must have exactly two keys: "voice" (string: one of "soft", "hype", "deep", or "asif_drop") and "text" (string: the actual affirmation).
DO NOT wrap the JSON in markdown code blocks. Just output the raw JSON object.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate 8 affirmations for mood: ${mood}` }
      ],
      model: MODEL_NAME,
      temperature: 0.8,
      response_format: { type: "json_object" } // Using groq json mode capability
    });

    let rawData = completion.choices[0]?.message?.content || "[]";
    
    // Fallback cleanup if the model included wrapping (even though it shouldn't)
    rawData = rawData.replace(/^```json/g, "").replace(/```$/g, "").trim();
    
    let parsedCards = [];
    try {
      const parsed = JSON.parse(rawData);
      // Depending on Groq's json_object, it might wrap it in an object like { "affirmations": [...] }
      if (Array.isArray(parsed)) {
        parsedCards = parsed;
      } else if (parsed.affirmations && Array.isArray(parsed.affirmations)) {
        parsedCards = parsed.affirmations;
      } else {
        // Just extract the values if it returned a dict of results
        parsedCards = Object.values(parsed).find(Array.isArray) || [];
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Data:", rawData);
      return res.status(500).json({ error: "Failed to parse JSON from AI" });
    }

    return res.status(200).json({ cards: parsedCards });
  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: "Failed to generate affirmations" });
  }
}
