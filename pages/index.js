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
    // Immediately push to vault page where the new dark UI handles everything
    router.push("/vault");
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
            <svg style={{display:"block", margin:"0 auto"}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </button>
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#5A2F3A", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
        }}>
          { /* We don't render the form here anymore, the router push will handle it immediately for aesthetic transition */ }
        </div>
      )}
    </main>
  );
}
