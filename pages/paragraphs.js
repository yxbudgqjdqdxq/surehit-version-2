// pages/paragraphs.js
import Link from 'next/link'
import paragraphs from '../public/data/paragraphs.json'

export default function Paragraphs() {
  return (
    <main className="paragraphs-page">
      <h2 className="page-title">Pick a Thought</h2>
      <div className="paragraph-grid">
        {paragraphs.map((p, i) => (
          <Link key={p.id ?? i} href={`/paragraphs/${i}`} legacyBehavior>
            <a className="para-button" aria-label={p.title}>
              <div className="para-left">
                <div className="para-tag">#{(i + 1).toString().padStart(2, '0')}</div>
                <div className="para-title">{p.title}</div>
              </div>
              <div className="para-arrow">→</div>
            </a>
          </Link>
        ))}
      </div>
    </main>
  )
}
