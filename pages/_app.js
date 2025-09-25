
import Head from 'next/head';
import '../styles/globals.css';
import AnimatedBackground from '../components/AnimatedBackground';

// Favicon SVG (white pixel heart)
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><path d="M4 1H3V2H2V3H1V4H0V7H1V8H2V9H3V10H4V11H5V12H6V13H7V14H8V15H9V14H10V13H11V12H12V11H13V10H14V9H15V8H16V7H15V4H14V3H13V2H12V1H11V2H10V3H9V4H8V5H7V4H6V3H5V2H4V1Z"/></svg>`;
const FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(FAVICON_SVG)}`;

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Pixel Heart Animation</title>
        <link rel="icon" href={FAVICON_DATA_URI} />
      </Head>

      <AnimatedBackground />

      {/* All site content will be rendered here, on top of the background */}
      <main className="site-root">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
