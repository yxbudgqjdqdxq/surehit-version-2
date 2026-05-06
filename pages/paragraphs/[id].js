
import { useRouter } from 'next/router'
import Link from 'next/link'
import paragraphs from '../../public/data/paragraphs.json'

export default function ParagraphPage() {
  const router = useRouter()
  const { id } = router.query
  const p = paragraphs[id]

  if (!p) return <div className="main-container"><p>Loading…</p></div>
  const lines = (p.text || p.content || "").split('\n')

  return (
    <main className="paragraph-view">
      <div className="paragraph-card">
        <Link href="/paragraphs" legacyBehavior><a className="back small">← Back</a></Link>
        <h2 className="para-title">{p.title}</h2>
        <div className="para-body">
          {lines.map((line, i) => <p key={`line-${i}`}>{line}</p>)}
        </div>
      </div>
    </main>
  )
}
