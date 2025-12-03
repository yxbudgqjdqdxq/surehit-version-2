import Groq from "groq-sdk";

// Initialize the Brain
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

const SYSTEM_PROMPT = `You are "Raven's Protocol". Keep replies short, robotic, and high-status.`;

export default async function handler(req, res) {
  // 1. Force headers immediately so the connection stays open
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed. Use POST.");
    }

    const { messages } = req.body;

    // 2. Attempt the Groq Call
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

    // 3. Stream success
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) res.write(content);
    }
    
    res.end();

  } catch (error) {
    // 4. CATCH ERRORS AND PRINT THEM TO THE CHAT
    console.error("Backend Error:", error);
    res.write(`\n[SYSTEM ERROR: ${error.message}]\n`);
    res.write("Check your server terminal for details.");
    res.end();
  }
}
