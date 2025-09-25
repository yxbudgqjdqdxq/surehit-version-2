// pages/vault.js
import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";

export default function VaultPage() {
  const router = useRouter();
  const { auth } = router.query;
  const allowed = String(auth) === "1";

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 720, textAlign: "center", background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 18px 50px rgba(0,0,0,0.09)" }}>
          <h2>Access Denied</h2>
          <p style={{ color: "rgba(0,0,0,0.6)" }}>You tried to open something private. This door stays closed unless you have the key.</p>
          <div style={{ marginTop: 18 }}>
            <button onClick={() => router.push("/")} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#b21b61", color: "#fff" }}>Return home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg,#fff0f6,#ffeef5)" }}>
      <div style={{ maxWidth: 900, width: "100%", background: "rgba(255,255,255,0.96)", padding: 34, borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginTop: 0 }}>A Private Note</h1>

        <div className="secret-paragraph" style={{ color: "rgba(0,0,0,0.7)", fontSize: 18, lineHeight: 1.8 }}>
          {/* <-- PASTE YOUR LONG-PARAGRAPH HERE WHEN READY --> */}
        </div>

        <div style={{ marginTop: 18 }}>
          <Link href="/"><a style={{ padding: "10px 14px", borderRadius: 10, background: "#b21b61", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Return home</a></Link>
        </div>
      </div>
    </div>
  );
}