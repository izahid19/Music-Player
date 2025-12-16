import type { Metadata } from "next";
import "../styles/app.scss";
import { Inter, Outfit } from 'next/font/google';
import AppWrapper from "../components/AppWrapper";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Playyly | Modern Music Player",
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
        <AppWrapper>
          <div id="root">{children}</div>
        </AppWrapper>
      </body>
    </html>
  );
}
