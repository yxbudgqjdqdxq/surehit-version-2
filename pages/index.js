// pages/index.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [hearts, setHearts] = useState([]);
  const router = useRouter();

  // --- RESTORED: HEART ANIMATION ---
  useEffect(() => {
    // Create random floating hearts
    const newHearts = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      animationDuration: Math.random() * 5 + 5 + "s", 
      animationDelay: Math.random() * 5 + "s",
      scale: Math.random() * 0.5 + 0.8 
    }));
    setHearts(newHearts);
  }, []);

  function handleMainClick() {
    setEntered(true);
  }

  function openSecret() {
    setPw("");
    setPwError("");
    setShowModal(true);
  }

  function submitPw(e) {
    e.preventDefault();
    if (pw.trim() === "14344") {
      setShowModal(false);
      router.push("/vault?auth=1");
    } else {
      setPwError("Wrong password. This covers something private — try again.");
    }
  }

  return (
    <main className="main-container" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", background: "linear-gradient(135deg, #ffe6fa 0%, #ffd1e8 100%)" }}>
      
      {/* --- INJECTED HEART STYLES --- */}
      <style jsx>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }
        .heart {
          position: absolute;
          bottom: -10%;
          font-size: 24px;
          color: #ff5a9e;
          opacity: 0.6;
          user-select: none;
          pointer-events: none;
          animation-name: floatUp;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0;
        }
        .content-layer {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
        }
      `}</style>

      {/* --- RENDER HEARTS --- */}
      {hearts.map((h) => (
        <div key={h.id} className="heart" style={{
            left: h.left,
            animationDuration: h.animationDuration,
            animationDelay: h.animationDelay,
            transform: `scale(${h.scale})`
          }}>
          ❤️
        </div>
      ))}

      {/* --- CONTENT LAYER --- */}
      <div className="content-layer">
        {!entered ? (
          <button className="landing-btn" onClick={handleMainClick}>
            I Missed You Bubu
          </button>
        ) : (
          <div className="choices" role="navigation" aria-label="Main choices">
            <Link href="/paragraphs" legacyBehavior><a className="choice-btn">Feeling Moody Today?</a></Link>
            <Link href="/chat" legacyBehavior><a className="choice-btn">Daily Affirmations</a></Link>
            <button onClick={openSecret} style={{
                padding: "12px 28px", borderRadius: 14, border: "none",
                background: "linear-gradient(90deg,#ff8ab1,#ff5a9e)", color: "white", fontWeight: 900,
                boxShadow: "0 14px 36px rgba(255,90,157,0.14)", cursor: "pointer", marginTop: "20px"
              }}>
              click this when you are super duper sad
            </button>
          </div>
        )}

        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.34)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
            <div style={{ width: "min(680px, 92%)", background: "#fff", padding: 22, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
              <h3 style={{ margin: 0 }}>Secret Vault</h3>
              <p style={{ color: "rgba(0,0,0,0.6)" }}>Enter the password to reveal a private message.</p>
              <form onSubmit={submitPw} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" autoFocus style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
                <button style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#b21b61", color: "#fff" }}>Open</button>
              </form>
              {pwError && <div style={{ color: "crimson", marginTop: 10 }}>{pwError}</div>}
              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
