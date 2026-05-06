"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SHIN-GAN SŌ-AI - CLOUD UPLINK 
 * * ARCHITECTURE: Groq Cloud API.
 * * SPEED: <1s Response Time.
 * * UI: Authentic and counterfeit mutual love design.
 */

export default function RavensProtocolPage() {
  // --- STATE ---
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); 
  const [status, setStatus] = useState("READY"); // Instantly Ready. No loading.
  
  // --- REFS ---
  const chatEndRef = useRef(null);
  
  // *** THE ETERNAL BUFFERS ***
  const streamRef = useRef(""); 
  const displayedRef = useRef(""); 
  
  // --- 1. THE ETERNAL TYPING LOOP ---
  // This keeps the "hacking/typing" visual effect smooth, even if the API is instant.
  useEffect(() => {
    let animationFrameId;

    const typeLoop = () => {
      const targetLen = streamRef.current.length;
      const currentLen = displayedRef.current.length;

      if (currentLen < targetLen) {
        // Adaptive Speed: Fast catchup, slow finish
        const distance = targetLen - currentLen;
        const speed = distance > 50 ? 5 : distance > 20 ? 3 : distance > 5 ? 2 : 1;

        const nextSlice = streamRef.current.slice(currentLen, currentLen + speed);
        displayedRef.current += nextSlice;

        // Force Update UI
        setMessages(prev => {
          const copy = [...prev];
          if (copy.length > 0) {
              const lastMsg = copy[copy.length - 1];
              if (lastMsg.role === "assistant") {
                lastMsg.content = displayedRef.current;
              }
          }
          return copy;
        });
      }

      animationFrameId = requestAnimationFrame(typeLoop);
    };

    animationFrameId = requestAnimationFrame(typeLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- 2. AUTO SCROLL ---
  useEffect(() => {
    if (messages.length > 0 || status === "GENERATING") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  // --- 3. SEND HANDLER (API CALL) ---
  const handleSend = useCallback(async () => {
    if (!input.trim() || status !== "READY") return;
    
    const userText = input.trim();
    setInput(""); 

    // 1. Add User Message
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setStatus("GENERATING");

    // 2. Prepare Buffers
    streamRef.current = "";
    displayedRef.current = "";
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      // 3. Call the API (The new ravens.js file)
      // We send the last 10 messages for context context memory
      const response = await fetch("/api/ravens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(-10) }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      // 4. Read the Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        streamRef.current += chunk; // Feed the eternal loop
      }

    } catch (err) {
      console.error(err);
      streamRef.current += " [CONNECTION SEVERED]";
    } finally {
      setStatus("READY");
    }
  }, [input, messages, status]);

  // --- RENDER HELPERS ---
  const isHeroMode = messages.length === 0;

  return (
    <div className="shingan-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .site-header { display: none !important; }
        
        @keyframes bleedIn {
          0% { opacity: 0; filter: blur(10px); transform: scale(1.05); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        
        @keyframes smokeOut {
          0% { opacity: 1; filter: blur(0px); transform: translateY(0); }
          100% { opacity: 0; filter: blur(20px); transform: translateY(-20px); }
        }
        
        @keyframes waveform {
          0%, 100% { height: 4px; opacity: 0.4; }
          50% { height: 14px; opacity: 1; }
        }

        @keyframes fadeInShift {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .shingan-root {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw; height: 100vh;
          /* The background: very deep desaturated Ruby Petals (#A55166) -> #1a080d */
          background-color: #1a080d; 
          color: #F7DAE7;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          z-index: 2147483647;
          display: flex; flex-direction: column; overflow: hidden;
          transition: background-color 1.5s ease;
        }

        /* Tense background shift when idle is handled programmatically, but base transitions are smooth */

        .shingan-header {
          position: relative; z-index: 10; display: flex; justify-content: center; 
          align-items: center; padding: 24px;
          animation: ${isHeroMode ? 'none' : 'fadeInShift 0.8s ease forwards'};
        }
        .shingan-brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400; font-size: 16px;
          letter-spacing: 4px; color: #F7DAE7;
          opacity: 0.6;
        }

        .shingan-main {
          position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column;
          padding-top: 20px; padding-bottom: 120px; overflow-y: auto; scrollbar-width: none;
        }
        .shingan-main::-webkit-scrollbar { display: none; }

        /* The Hero Void Entry Sequence */
        .shingan-hero { 
          position: absolute; top: 0; left: 0; right: 0; 
          height: 70vh; display: flex; flex-direction: column; 
          align-items: center; justify-content: center; text-align: center;
          pointer-events: none; z-index: 5;
        }
        .shingan-hero.has-messages {
          animation: smokeOut 1.5s ease forwards;
        }

        .hero-kanji {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4rem; color: #F7DAE7; font-weight: 300;
          letter-spacing: 12px; margin-bottom: 12px;
          display: flex;
        }
        .kanji-char { animation: bleedIn 2s ease both; }
        .kanji-char:nth-child(1) { animation-delay: 0.5s; }
        .kanji-char:nth-child(2) { animation-delay: 0.9s; }
        .kanji-char:nth-child(3) { animation-delay: 1.3s; }
        .kanji-char:nth-child(4) { animation-delay: 1.7s; }

        .hero-romaji {
          font-family: 'DM Sans', sans-serif; font-weight: 100;
          font-size: 0.9rem; letter-spacing: 8px; color: #E2B4C1;
          animation: bleedIn 2s ease both;
          animation-delay: 2.5s; margin-left: 8px; /* account for tracking */
        }

        .hero-translation {
          font-family: 'DM Sans', sans-serif; font-weight: 100; font-style: italic;
          font-size: 0.75rem; letter-spacing: 2px; color: #D38C9D;
          animation: bleedIn 2s ease both;
          animation-delay: 4.5s; margin-top: 24px;
        }

        @media (prefers-reduced-motion: reduce) {
          .kanji-char, .hero-romaji, .hero-translation {
            animation: none !important;
            opacity: 1 !important;
            filter: blur(0px) !important;
            transform: scale(1) !important;
          }
        }

        /* Message Layout */
        .shingan-chat-list { 
          max-width: 600px; margin: 0 auto; width: 100%; padding: 0 24px; 
          display: flex; flex-direction: column; gap: 32px; 
          animation: fadeInShift 0.8s ease forwards;
        }
        
        .shingan-msg { display: flex; width: 100%; }
        .shingan-msg.user { justify-content: flex-end; }
        .shingan-msg.bot { justify-content: flex-start; }
        
        .shingan-bubble.user {
          background: rgba(226, 180, 193, 0.15); /* Bubblegum slightly transparent */
          border: 1px solid rgba(226, 180, 193, 0.2);
          color: #E2B4C1;
          padding: 12px 20px; border-radius: 20px;
          border-bottom-right-radius: 4px; font-size: 15px; max-width: 75%;
          line-height: 1.5; font-weight: 300;
          animation: fadeInShift 0.5s ease forwards;
        }

        .shingan-bubble.bot {
          color: #F7DAE7; /* Pink Mist */
          font-size: 15px; max-width: 85%;
          line-height: 1.6; font-weight: 300;
          white-space: pre-wrap; letter-spacing: 0.2px;
        }

        .shingan-input-wrapper {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
          padding: 20px 24px 40px 24px; display: flex; justify-content: center;
          animation: fadeInShift 1s ease forwards;
          background: linear-gradient(to top, rgba(26, 8, 13, 0.9) 30%, transparent);
        }
        .shingan-input-box {
          width: 100%; max-width: 600px; position: relative;
          background: rgba(165, 81, 102, 0.05); /* Ruby petals tint */
          border-top: 1px solid rgba(165, 81, 102, 0.3); /* 1px border */
          display: flex; align-items: center; 
        }
        
        .shingan-input {
          width: 100%; height: 50px; background: transparent; border: none; outline: none;
          color: #F7DAE7; padding: 0 16px; font-size: 15px; font-family: 'DM Sans', sans-serif;
          font-weight: 300; caret-color: #D38C9D;
        }
        .shingan-input::placeholder { color: rgba(247, 218, 231, 0.5); font-weight: 300; font-style: italic; letter-spacing: 0.5px; opacity: 1; }
        
        .shingan-send-btn {
          height: 36px; width: 36px; margin-right: 8px; background: transparent;
          border: none; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #A55166; transition: color 0.3s;
        }
        .shingan-send-btn:hover { color: #E2B4C1; }
        .shingan-send-btn:disabled { color: rgba(165, 81, 102, 0.2); cursor: not-allowed; }

        .typing-indicator {
          display: inline-flex; align-items: center; gap: 3px; height: 16px; margin-left: 6px;
        }
        .typing-line {
          width: 1px; background-color: #D38C9D;
          animation: waveform 1s ease-in-out infinite;
        }
        .typing-line:nth-child(1) { animation-delay: 0s; animation-duration: 1.2s; }
        .typing-line:nth-child(2) { animation-delay: 0.3s; animation-duration: 0.9s; }
        .typing-line:nth-child(3) { animation-delay: 0.1s; animation-duration: 1.1s; }
      `}</style>

      <header className="shingan-header">
        <div className="shingan-brand">真贋相愛</div>
      </header>

      <main className="shingan-main">
        <div className={`shingan-hero ${messages.length > 0 ? 'has-messages' : ''}`}>
          <div className="hero-kanji">
            <span className="kanji-char">真</span>
            <span className="kanji-char">贋</span>
            <span className="kanji-char">相</span>
            <span className="kanji-char">愛</span>
          </div>
          <div className="hero-romaji">shin-gan sō-ai</div>
          <div className="hero-translation">"authentic and counterfeit mutual love"</div>
        </div>

        <div className="shingan-chat-list">
          {messages.map((m, i) => (
            <div key={i} className={`shingan-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
              <div className={`shingan-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
                {m.content}
                {m.role === "assistant" && i === messages.length - 1 && (
                    (status === "GENERATING") || (displayedRef.current.length < streamRef.current.length)
                ) && (
                    <span className="typing-indicator">
                      <span className="typing-line"></span>
                      <span className="typing-line"></span>
                      <span className="typing-line"></span>
                    </span>
                )}
              </div>
            </div>
          ))}
          
          {status === "GENERATING" && displayedRef.current === "" && (
             <div className="shingan-msg bot">
               <div className="shingan-bubble bot" style={{ display: 'flex', alignItems: 'center' }}>
                 <span className="typing-indicator">
                    <span className="typing-line"></span>
                    <span className="typing-line"></span>
                    <span className="typing-line"></span>
                 </span>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <div className="shingan-input-wrapper">
        <div className="shingan-input-box">
          <input 
            className="shingan-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={status === "GENERATING"}
            spellCheck="false"
            placeholder="say something unique..."
          />
          <button 
            className="shingan-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || status === "GENERATING"}
          >
            {status === "GENERATING" ? (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                 <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                 <path d="M12 2a10 10 0 0 1 10 10" className="animate-spin" />
               </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
