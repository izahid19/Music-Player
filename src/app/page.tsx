import type { Metadata } from 'next';
import LandingPageClient from '../components/LandingPageClient';
import { WebsiteJsonLd, SoftwareApplicationJsonLd, OrganizationJsonLd } from '../components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Playyly | Free Modern Music Player - Stream Music Online',
  description: 'Stream music free with Playyly - a beautiful web music player featuring dark mode, shuffle, repeat, favorites, and library management. No downloads required. Start listening now!',
  alternates: {
    canonical: 'https://playyly.vercel.app',
  },
  openGraph: {
    title: 'Playyly | Free Modern Music Player',
    description: 'Stream music free with Playyly - featuring dark mode, shuffle, favorites, and smooth playback. No downloads required.',
    url: 'https://playyly.vercel.app',
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <WebsiteJsonLd />
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />
      
      {/* Client-side landing page content */}
      <LandingPageClient />
    </>
  );
}
