import Groq from "groq-sdk";

// Initialize the Brain
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

const SYSTEM_PROMPT = `You are "Raven's Protocol". Keep replies short, robotic, and high-status. Brevity is power. Do not apologize. Do not be emotional. If asked about Asif, provide facts, not feelings.`;

export default async function handler(req, res) {
  // 1. Check Method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    // 2. Call Groq AI
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

    // 3. Set Headers for Streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 4. Stream the text back to the chat
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }
    
    res.end();

  } catch (error) {
    console.error("CRITICAL API ERROR:", error);
    // This will help us see the REAL error in the browser console if it fails
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
