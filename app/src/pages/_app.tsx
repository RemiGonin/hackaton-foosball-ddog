import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";

import { EventsProvider } from "@/context/events";

const inter = Roboto({ subsets: ["latin"], weight: ["300", "500", "900"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <EventsProvider>
        <Component {...pageProps} />
      </EventsProvider>
    </>
  );
}
