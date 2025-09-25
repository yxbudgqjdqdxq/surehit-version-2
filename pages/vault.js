// pages/vault.js
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CORRECT_PASSWORD = "14344";

const SECRET_PARAGRAPH = `“I love you without knowing how, or when, or from where.” — Pablo Neruda

I know you’re reading this because something’s heavy right now… maybe it’s us, maybe it’s something that happened to you today, maybe it’s both. I won’t pretend I know exactly how it feels in your chest; I only trust that if you picked this up it means you needed a little anchor. Maybe my old letters don’t help in this hour. Maybe the paragraphs I wrote used to matter and don’t right now. That’s okay. You don’t have to carry how I felt then — only what helps you now.

I want you to know, first and loud: I’m proud of you. Not because you did something to earn it, but because you exist and you keep going. Whether I’m standing next to you or not, I’m proud that someone like you walked into my life. That fact — that moment — I’ll cherish it forever. It made me better. It taught me how to notice small things. It taught me patience. I don’t say that to flatter; I say it to fix a truth in plain sight: you matter. Plain and simple.

I see where you are. I know grief and anger and confusion can look the same on your face. If you’re hurt by me — I’m sorry. If you’re hurt by someone else — that’s not your fault. If you feel abandoned, betrayed, or small, those feelings are valid. You don’t need to tidy them up for anyone. Let them be messy. Let them be loud. You’re allowed to feel without explanation.

Here’s something I need you to hold onto: you are not alone in this. My promise isn’t a theatrical “I’ll fix everything” — it’s a steady one. I will listen when you need words. I will step back when you need space. I will not make you explain your tears to prove their worth. I’ll remind you who you were before the noise came and I’ll remind you who you can still be. That’s my loverboy code for you — quiet, consistent, never performative.

Practical steps, since feelings alone don’t unfry the mess: breathe first — five slow breaths. Put your phone aside for an hour. Move your body even a little (walk, stretch). Drink water. If you feel talkable, tell one person — not to solve it, just to unload. Write one sentence about what hurts and one sentence about what you want next. Sleep if you can; sleep is underrated. If everything’s dark and feels out of reach for days, get help — a friend, a counselor — do not try to be a lone island. Small actions stack. Work on little things and the big thing will follow.

And remember: working on yourself isn’t about erasing pain or pretending you weren’t hurt. It’s about making sure you’re the one steering the ship again. If you choose to rebuild, do it on terms that make you stronger — not smaller. Be selfish with your healing. Invest in the habits that remind you you’re worth steady effort.

I love you. I always will. Not as a demand, not as a punishment, but as a fact: something steady that doesn’t require your approval to exist. Take your time. Do it your way. If you want me in the process, I’ll be there — patient, honest, and without theatrics.

— Asif
`;

export default function VaultPage() {
  const router = useRouter();
  const { auth } = router.query;

  // local state auth: either from URL (?auth=1) or from password form
  const [allowed, setAllowed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    // If URL contains ?auth=1 we grant access immediately
    if (String(auth) === "1") setAllowed(true);
  }, [auth]);

  function tryUnlock(e) {
    e && e.preventDefault();
    setErr("");
    if (pw === CORRECT_PASSWORD) {
      setAllowed(true);
      setPw("");
      // Optionally update URL so the page can be shared as open:
      // router.replace('/vault?auth=1', undefined, { shallow: true });
    } else {
      setErr("Password incorrect — please try again 💔");
      setPw("");
    }
  }

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 720, textAlign: "center", background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 18px 50px rgba(0,0,0,0.09)" }}>
          <h2 style={{ marginTop: 0 }}>Access Vault</h2>
          <p style={{ color: "rgba(0,0,0,0.6)" }}>This section is private. Enter the password or return home.</p>

          <form onSubmit={tryUnlock} style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center" }}>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter password"
              aria-label="vault password"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", minWidth: 200 }}
            />
            <button type="submit" style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#b21b61", color: "#fff", fontWeight: 700 }}>
              Unlock
            </button>
          </form>

          {err && <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>}

          <div style={{ marginTop: 18 }}>
            <button onClick={() => router.push("/")} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#eee", color: "#111", cursor: "pointer" }}>
              Return home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Allowed: show secret
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg,#fff0f6,#ffeef5)" }}>
      <div style={{ maxWidth: 900, width: "100%", background: "rgba(255,255,255,0.96)", padding: 34, borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginTop: 0 }}>A Private Note</h1>

        <div className="secret-paragraph" style={{ color: "rgba(0,0,0,0.7)", fontSize: 18, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {SECRET_PARAGRAPH}
        </div>

        <div style={{ marginTop: 18 }}>
          <Link href="/"><a style={{ padding: "10px 14px", borderRadius: 10, background: "#b21b61", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Return home</a></Link>
        </div>
      </div>
    </div>
  );
}