
import '../styles/globals.css'
import AnimatedBackground from '../components/AnimatedBackground'

export default function App({ Component, pageProps }) {
  return (
    <>
      <AnimatedBackground />
      <div className="site-root">
        <Component {...pageProps} />
      </div>
    </>
  )
}
