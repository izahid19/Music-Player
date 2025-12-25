import type { Metadata } from "next";
import "../styles/app.scss";
import { Inter, Outfit } from 'next/font/google';
import AppWrapper from "../components/AppWrapper";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL('https://playyly.vercel.app'),
  title: {
    default: "Playyly | Modern Music Player - Free Online Streaming",
    template: "%s | Playyly",
  },
  description: "A beautiful, interactive music player built with React and Next.js. Features dark mode, real-time search, library management, shuffle, favorites, and smooth playback controls. Stream music free online.",
  keywords: [
    "music player",
    "free music streaming",
    "online music player",
    "web music app",
    "react music player",
    "nextjs music app",
    "spotify alternative",
    "audio player",
    "playyly",
    "dark mode music player",
    "music library",
    "playlist manager"
  ],
  authors: [{ name: "Zahid", url: "https://devzahid.vercel.app/" }],
  creator: "Zahid",
  publisher: "Playyly",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: 'https://playyly.vercel.app',
  },
  openGraph: {
    title: "Playyly | Modern Music Player - Free Online Streaming",
    description: "A beautiful, interactive music player with dark mode, library management, shuffle, favorites, and smooth playback controls. Stream music free.",
    url: "https://playyly.vercel.app",
    siteName: "Playyly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Playyly - Modern Music Player with Dark Mode",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playyly | Modern Music Player",
    description: "A beautiful, interactive music player with dark mode, shuffle, and smooth playback controls. Stream music free online.",
    images: ["/og-image.png"],
    creator: "@devzahid",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'music',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AppWrapper>
          <div id="root">{children}</div>
        </AppWrapper>
      </body>
    </html>
  );
}
