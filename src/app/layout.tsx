import type { Metadata } from "next";
// import localFont from "next/font/local";
import "../styles/app.scss";
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Playly | Modern Music Player",
  description: "A beautiful, interactive music player built with React. Features dark mode, real-time search, library management, and smooth playback controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
