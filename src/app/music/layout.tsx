import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music Player - Stream Your Favorite Tracks',
  description: 'Listen to your favorite tracks with Playyly\'s beautiful music player interface. Features shuffle, repeat, favorites, keyboard shortcuts, and volume controls. Stream music free.',
  alternates: {
    canonical: 'https://playyly.vercel.app/music',
  },
  openGraph: {
    title: 'Playyly Music Player',
    description: 'Stream your favorite music with Playyly - featuring shuffle, repeat, favorites, and smooth playback controls.',
    url: 'https://playyly.vercel.app/music',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
