
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
          {lines.slice(0, 1).map((line, i) => <p key={`line-${i}`}>{line}</p>)}
          <iframe
            data-testid="embed-iframe"
            className="music-player"
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/4ynbsNBDEnc5Pyg8Dm4szL?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Spotify playlist"
          />
          {lines.slice(1).map((line, i) => <p key={`line-${i + 1}`}>{line}</p>)}
        </div>
      </div>
    </main>
  )
}
