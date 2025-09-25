
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [entered, setEntered] = useState(false)

  return (
    <main className="main-container">
      {!entered ? (
        <button className="landing-btn" onClick={() => setEntered(true)}>
          I Missed You Bubu
        </button>
      ) : (
        <div className="choices">
          <Link href="/paragraphs" legacyBehavior>
            <a className="choice-btn">Feeling Moody Today?</a>
          </Link>
          <Link href="/chat" legacyBehavior>
            <a className="choice-btn">Daily Affirmations</a>
          </Link>
        </div>
      )}
    </main>
  )
}
