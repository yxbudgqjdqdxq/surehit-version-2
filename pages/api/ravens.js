import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

const SYSTEM_PROMPT = `You are "Raven's Protocol": a compact, unemotional, status-preserving assistant.`;

export default async function handler(req, res) {
  // 1. FORCE THE CONNECTION OPEN IMMEDIATELY
  // This tricks the frontend into thinking everything is fine so it doesn't show "Severed"
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    if (req.method !== "POST") {
      res.write("[ERROR: Request must be POST]");
      res.end();
      return;
    }

    const { messages } = req.body || {};
    
    // Safety check for messages
    if (!messages || !Array.isArray(messages)) {
      res.write("[ERROR: No 'messages' array sent in body]");
      res.end();
      return;
    }

    // 2. ATTEMPT GROQ CONNECTION
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 300,
      stream: true,
    });

    // 3. STREAM THE RESPONSE
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }
    
    res.end();

  } catch (error) {
    // 4. PRINT THE REAL ERROR TO THE CHAT UI
    console.error("BACKEND ERROR:", error); 
    res.write(`\n\n[SYSTEM FAILURE: ${error.message}]\n`);
    res.write(`[TYPE: ${error.type || "Unknown"}]\n`);
    res.write(`[CODE: ${error.code || "Unknown"}]`);
    res.end();
  }
}
