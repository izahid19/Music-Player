import { NextRequest, NextResponse } from 'next/server';
import forge from 'node-forge';

// User agents to rotate for requests
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Mobile/15E148 Safari/604.1',
];

// Get random user agent
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Decrypt JioSaavn encrypted media URL using DES-ECB (using node-forge)
function decryptMediaUrl(encryptedUrl: string): string {
  if (!encryptedUrl) {
    return '';
  }
  
  const key = '38346591';
  const iv = '00000000';
  
  try {
    const encrypted = forge.util.decode64(encryptedUrl);
    const decipher = forge.cipher.createDecipher('DES-ECB', forge.util.createBuffer(key));
    decipher.start({ iv: forge.util.createBuffer(iv) });
    decipher.update(forge.util.createBuffer(encrypted));
    decipher.finish();
    
    const decryptedLink = decipher.output.getBytes();
    return decryptedLink;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// Create download links with different qualities
function createDownloadLinks(encryptedMediaUrl: string) {
  if (!encryptedMediaUrl) return [];
  
  const decryptedLink = decryptMediaUrl(encryptedMediaUrl);
  if (!decryptedLink) return [];
  
  const qualities = [
    { id: '_12', bitrate: '12kbps' },
    { id: '_48', bitrate: '48kbps' },
    { id: '_96', bitrate: '96kbps' },
    { id: '_160', bitrate: '160kbps' },
    { id: '_320', bitrate: '320kbps' }
  ];
  
  return qualities.map((quality) => ({
    quality: quality.bitrate,
    url: decryptedLink.replace('_96', quality.id)
  }));
}

// Create image links with different qualities
function createImageLinks(link: string) {
  if (!link) return [];
  
  const qualities = ['50x50', '150x150', '500x500'];
  const qualityRegex = /150x150|50x50/;
  const protocolRegex = /^http:\/\//;
  
  return qualities.map((quality) => ({
    quality,
    url: link.replace(qualityRegex, quality).replace(protocolRegex, 'https://')
  }));
}

// Transform raw JioSaavn API response to our format
function transformSong(song: any) {
  const moreInfo = song.more_info || {};
  const artistMap = moreInfo.artistMap || {};
  
  // Get primary artists names
  const primaryArtists = artistMap.primary_artists || [];
  const artistNames = primaryArtists.map((a: any) => a.name).join(', ') || song.subtitle || 'Unknown Artist';
  
  // Get images
  const images = createImageLinks(song.image);
  const highQualityImage = images.find(i => i.quality === '500x500') 
    || images.find(i => i.quality === '150x150')
    || images[0];
  
  // Get download URLs
  const downloadUrls = createDownloadLinks(moreInfo.encrypted_media_url);
  const highQualityAudio = downloadUrls.find(d => d.quality === '320kbps')
    || downloadUrls.find(d => d.quality === '160kbps')
    || downloadUrls.find(d => d.quality === '96kbps')
    || downloadUrls[0];
  
  return {
    id: `jiosaavn_${song.id}`,
    name: song.title || song.song,
    artist: artistNames,
    cover: highQualityImage?.url || '',
    audio: highQualityAudio?.url || '',
    color: ['#667eea', '#764ba2'] as [string, string], // Default gradient
    active: false,
    source: 'jiosaavn' as const,
    album: moreInfo.album,
    duration: moreInfo.duration ? Number(moreInfo.duration) : undefined,
    year: song.year,
  };
}

// Fetch from JioSaavn API directly
async function searchJioSaavn(query: string, limit: number = 10, page: number = 0) {
  const url = new URL('https://www.jiosaavn.com/api.php');
  
  url.searchParams.append('__call', 'search.getResults');
  url.searchParams.append('_format', 'json');
  url.searchParams.append('_marker', '0');
  url.searchParams.append('api_version', '4');
  url.searchParams.append('ctx', 'web6dot0');
  url.searchParams.append('q', query);
  url.searchParams.append('p', String(page));
  url.searchParams.append('n', String(limit));
  
  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': getRandomUserAgent(),
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error(`JioSaavn API error: ${response.status}`);
  }
  
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '0');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        songs: [],
        total: 0,
      });
    }

    // Fetch from JioSaavn directly
    const data = await searchJioSaavn(query, limit, page);
    
    if (!data || !data.results) {
      return NextResponse.json({
        success: true,
        songs: [],
        total: 0,
      });
    }

    // Transform songs to Playly format, filter only songs with valid audio
    const songs = data.results
      .filter((song: any) => song.more_info?.encrypted_media_url)
      .slice(0, limit)
      .map(transformSong)
      .filter((song: any) => song.audio);

    return NextResponse.json({
      success: true,
      songs,
      total: data.total || songs.length,
    });
  } catch (error) {
    console.error('JioSaavn search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search JioSaavn',
      songs: [],
    });
  }
}
