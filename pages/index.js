// pages/index.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const router = useRouter();

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
      // small shake animation is possible with CSS but keeping it simple & robust.
    }
  }

  return (
    <main className="main-container">
      {!entered ? (
        <button className="landing-btn" onClick={handleMainClick}>
          I Missed You Bubu
        </button>
      ) : (
        <div className="choices" role="navigation" aria-label="Main choices">
          <Link href="/paragraphs" legacyBehavior>
            <a className="choice-btn">is today being difficult?</a>
          </Link>

          <Link href="/chat" legacyBehavior>
            <a className="choice-btn">want to know what I think about you?</a>
          </Link>

          {/* Secret vault button */}
          <button
            onClick={openSecret}
            style={{
              padding: "14px 32px",
              borderRadius: 24,
              border: "none",
              background: "#A55166", /* Ruby Petals Solid */
              color: "#F7DAE7", /* Pink Mist Text */
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(165, 81, 102, 0.25)",
              cursor: "pointer",
              transition: "all .3s cubic-bezier(0.25, 0.8, 0.25, 1)",
              width: "100%",
              maxWidth: "320px",
              marginTop: "8px"
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(165, 81, 102, 0.35)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(165, 81, 102, 0.25)"; }}
          >
            click this when you are super duper sad
          </button>
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.34)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
        }}>
          <div style={{ width: "min(680px, 92%)", background: "#fff", padding: 22, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: 0 }}>Secret Vault</h3>
            <p style={{ color: "rgba(0,0,0,0.6)" }}>Enter the password to reveal a private message.</p>

            <form onSubmit={submitPw} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                autoFocus
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <button style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#b21b61", color: "#fff" }}>Open</button>
            </form>

            {pwError && <div style={{ color: "crimson", marginTop: 10 }}>{pwError}</div>}

            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
