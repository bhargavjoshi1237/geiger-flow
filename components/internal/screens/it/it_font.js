import { Inter } from "next/font/google";

// The tracker is typeset in Inter with Linear's OpenType features, so it reads
// like Linear rather than like the rest of the suite (which is on Geist). Shared
// by the /it route and the playground's tracker embeds.
export const itFont = Inter({
  subsets: ["latin"],
  variable: "--font-it-sans",
  display: "swap",
});
