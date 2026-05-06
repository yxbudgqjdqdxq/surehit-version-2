// pages/_app.js
import { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import AnimatedBackground from "../components/AnimatedBackground";
import Header from "../components/Header";
import "../styles/globals.css";

const GA_MEASUREMENT_ID = "G-VFD4DC3SSE";

export default function MyApp({ Component, pageProps }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faviconSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
      <path fill='white' d='M12 21s-7.33-4.94-9.2-8.02C.8 9.9 3.2 6.5 6.2 6.5c1.7 0 2.68 1.1 3.3 2.05.33.52.62 1.02 1.5 1.02.88 0 1.17-.5 1.5-1.02.62-.95 1.6-2.05 3.3-2.05 3 0 5.4 3.4 3.4 6.48C19.33 16.06 12 21 12 21z'/>
    </svg>
  `);

  return (
    <>
      <Head>
        <title>🤍 ilovemybubu.vercel.app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={`data:image/svg+xml;utf8,${faviconSvg}`} />
      </Head>

      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
          `,
        }}
      />

      {/* --- YOUR ORIGINAL BACKGROUND & HEADER --- */}
      <AnimatedBackground />
      <Header />

      <div className="site-root">
        <Component {...pageProps} />
      </div>
      <div className={`spotify-floating-player ${isScrolled ? "minimized" : ""}`}>
        <div className="music-icon">🎵</div>
        <div className="player-content">
          <iframe
            title="Spotify playlist"
            src="https://open.spotify.com/embed/playlist/4ynbsNBDEnc5Pyg8Dm4szL?utm_source=generator&theme=0"
            width="300"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
          <div className="spotify-note">
            Best enjoyed while logged into Spotify in your browser! {"<3"}
            <a
              className="spotify-fallback"
              href="https://open.spotify.com/playlist/4ynbsNBDEnc5Pyg8Dm4szL"
              target="_blank"
              rel="noreferrer"
            >
              Play on Spotify
            </a>
          </div>
        </div>
      </div>

    </>
  );
}
