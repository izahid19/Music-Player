import type { Metadata } from "next";
import "../styles/app.scss";
import { Inter, Outfit } from 'next/font/google';
import AppWrapper from "../components/AppWrapper";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL('https://playyly.vercel.app'),
  title: "Playyly | Modern Music Player",
  description: "A beautiful, interactive music player built with React. Features dark mode, real-time search, library management, and smooth playback controls.",
  keywords: ["music player", "react", "nextjs", "spotify alternative", "audio player", "playyly"],
  authors: [{ name: "Playyly" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Playyly | Modern Music Player",
    description: "A beautiful, interactive music player with dark mode, library management, and smooth playback controls.",
    url: "https://playyly.vercel.app",
    siteName: "Playyly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Playyly Music Player",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playyly | Modern Music Player",
    description: "A beautiful, interactive music player with dark mode and smooth playback controls.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
