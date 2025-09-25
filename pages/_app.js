
// pages/app.js
import Head from "next/head";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  // favicon: small white heart SVG as data URL
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

      <AnimatedBackground />

      <div className="site-root">
        <Component {...pageProps} />
      </div>
    </>
  );
}