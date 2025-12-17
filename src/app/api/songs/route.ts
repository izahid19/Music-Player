import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

// GET songs with pagination and search (public)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { artist: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // If fetchAll is true, return all songs without pagination
    if (fetchAll) {
      const songs = await Song.find(searchQuery).sort({ playCount: -1, createdAt: -1 });
      
      const formattedSongs = songs.map((song, index) => ({
        id: song._id.toString(),
        name: song.name,
        artist: song.artist,
        cover: song.cover,
        audio: song.audio,
        color: song.color,
        active: index === 0,
        addedBy: song.addedBy,
        playCount: song.playCount || 0,
      }));

      return NextResponse.json(formattedSongs);
    }

    // Get total count for pagination
    const total = await Song.countDocuments(searchQuery);

    // Get paginated songs
    const songs = await Song.find(searchQuery)
      .sort({ playCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Transform to match the expected format
    const formattedSongs = songs.map((song, index) => ({
      id: song._id.toString(),
      name: song.name,
      artist: song.artist,
      cover: song.cover,
      audio: song.audio,
      color: song.color,
      active: page === 1 && index === 0,
      addedBy: song.addedBy,
      playCount: song.playCount || 0,
    }));

    return NextResponse.json({
      songs: formattedSongs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get songs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// POST new song (protected)
export async function POST(request: NextRequest) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { name, artist, cover, audio, color, playCount } = body;

    if (!name || !artist || !cover || !audio || !color) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const song = await Song.create({
      name,
      artist,
      cover,
      audio,
      color,
      playCount: playCount || 0,
      active: false,
      addedBy: auth.email, // Track which admin added this song
    });

    return NextResponse.json({
      success: true,
      song: {
        id: song._id.toString(),
        name: song.name,
        artist: song.artist,
        cover: song.cover,
        audio: song.audio,
        color: song.color,
        active: song.active,
        addedBy: song.addedBy,
        playCount: song.playCount,
      },
    });
  } catch (error) {
    console.error('Create song error:', error);
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}
