"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * RAVEN'S PROTOCOL - CLOUD UPLINK (V14)
 * * ARCHITECTURE: Switched from Local WebGPU to Groq Cloud API.
 * * SPEED: <1s Response Time.
 * * LOGIC: Retains the "Eternal Loop" typing effect for smooth UI.
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="ravens-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        .site-header { display: none !important; }
        
        .ravens-root {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw; height: 100vh;
          background-color: #0f2123; color: white;
          font-family: 'Inter', sans-serif;
          z-index: 2147483647;
          display: flex; flex-direction: column; overflow: hidden;
        }

        .ravens-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.4; pointer-events: none; }
        .ravens-bg img { width: 100%; height: 100%; object-fit: cover; }
        .ravens-overlay { position: absolute; inset: 0; background: rgba(15, 33, 35, 0.8); }

        .ravens-header {
          position: relative; z-index: 10; display: flex; justify-content: space-between; 
          align-items: center; padding: 20px 40px;
        }
        .ravens-brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 18px; }
        
        .ravens-main {
          position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column;
          padding-top: 60px; padding-bottom: 120px; overflow-y: auto; scrollbar-width: none;
        }
        .ravens-main::-webkit-scrollbar { display: none; }

        .ravens-hero { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; }
        .ravens-title { font-size: 48px; font-weight: 700; line-height: 1.1; margin-bottom: 16px; }
        .ravens-accent { color: #00e5ff; }
        .ravens-subtitle { font-size: 18px; color: rgba(255,255,255,0.7); margin-bottom: 48px; }

        .ravens-bubble-container {
          display: flex; align-items: flex-start; gap: 16px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px); padding: 16px; border-radius: 16px; border-top-left-radius: 4px;
        }

        .ravens-chat-list { max-width: 800px; margin: 0 auto; width: 100%; padding: 0 20px; display: flex; flex-direction: column; gap: 24px; }
        .ravens-msg { display: flex; gap: 16px; align-items: flex-start; }
        .ravens-msg.user { flex-direction: row-reverse; }
        
        .ravens-msg-bubble {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          padding: 16px; border-radius: 16px; line-height: 1.6; font-size: 15px; max-width: 80%;
          white-space: pre-wrap;
        }
        .ravens-msg.bot .ravens-msg-bubble { border-top-left-radius: 4px; color: rgba(255,255,255,0.9); }
        .ravens-msg.user .ravens-msg-bubble { border-top-right-radius: 4px; background: #00e5ff; color: #000; font-weight: 500; border: none; }

        .ravens-input-wrapper {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
          background: linear-gradient(to top, #0f2123 20%, transparent);
          padding: 20px 20px 40px 20px; display: flex; justify-content: center;
        }
        .ravens-input-box {
          width: 100%; max-width: 900px; position: relative;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 100px;
          display: flex; align-items: center; transition: border-color 0.2s;
        }
        .ravens-input-box:focus-within { border-color: rgba(0, 229, 255, 0.5); }
        .ravens-input {
          width: 100%; height: 56px; background: transparent; border: none; outline: none;
          color: white; padding: 0 24px; font-size: 16px;
        }
        .ravens-send-btn {
          height: 40px; width: 40px; margin-right: 8px; background: #00e5ff;
          border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #000;
        }
        .ravens-send-btn:disabled { background: #333; cursor: not-allowed; }

        .status-pill {
            padding: 4px 8px; border-radius: 4px; font-size: 10px; font-family: monospace;
            background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
        }
        .status-pill.good { color: #00e5ff; border-color: #00e5ff; }

        .typing-cursor::after {
          content: '▋'; display: inline-block; vertical-align: middle;
          animation: blink 1s step-start infinite; color: #00e5ff; margin-left: 2px;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      <div className="ravens-bg">
        <img src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop" alt="nebula" />
        <div className="ravens-overlay"></div>
      </div>

      <header className="ravens-header">
        <div className="ravens-brand">
          <span style={{color: '#00e5ff', fontSize: '24px', marginRight: '8px'}}>✦</span>
          <span>Ravens Protocol</span>
        </div>
        
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <div className="status-pill good">ONLINE</div>
        </div>
      </header>

      <main className="ravens-main">
        {isHeroMode && (
          <div className="ravens-hero animate-in fade-in zoom-in duration-500">
            <h1 className="ravens-title">Ravens Protocol — <br/><span className="ravens-accent">Know him from me</span></h1>
            <p className="ravens-subtitle">What's bothering you recently?</p>
            <div className="ravens-bubble-container">
              <div style={{width:'32px', height:'32px', background:'rgba(0,229,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#00e5ff'}}>✦</div>
              <div>
                <p style={{color:'#00e5ff', fontSize:'12px', fontWeight:'bold', marginBottom:'4px'}}>Ravens Protocol</p>
                <p>Greetings.</p>
              </div>
            </div>
          </div>
        )}

        <div className="ravens-chat-list">
          {messages.map((m, i) => (
            <div key={i} className={`ravens-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
              <div className="ravens-msg-bubble">
                {m.content}
                {m.role === "assistant" && i === messages.length - 1 && (
                    (status === "GENERATING") || (displayedRef.current.length < streamRef.current.length)
                ) && (
                    <span className="typing-cursor"></span>
                )}
              </div>
            </div>
          ))}
          
          {status === "GENERATING" && displayedRef.current === "" && (
             <div className="ravens-msg bot">
               <div className="ravens-msg-bubble" style={{color: '#00e5ff', fontStyle:'italic'}}>
                 Computing...
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <div className="ravens-input-wrapper">
        <div className="ravens-input-box">
          <input 
            className="ravens-input"
            placeholder="Ask Ravens Protocol anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={status === "GENERATING"}
          />
          <button 
            className="ravens-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || status === "GENERATING"}
          >
            {status === "GENERATING" ? (
              <div style={{width:'16px', height:'16px', border:'2px solid black', borderTopColor:'transparent', borderRadius:'50%'}} className="animate-spin"></div>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
