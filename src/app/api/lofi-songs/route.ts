import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LofiSong from '@/models/LofiSong';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

// GET lofi songs with pagination and search (public)
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
      const songs = await LofiSong.find(searchQuery).sort({ playCount: -1, createdAt: -1 });
      
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
    const total = await LofiSong.countDocuments(searchQuery);

    // Get paginated songs
    const songs = await LofiSong.find(searchQuery)
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

    // Get total streams count
    const streamsResult = await LofiSong.aggregate([
      { $match: searchQuery },
      { $group: { _id: null, totalStreams: { $sum: '$playCount' } } }
    ]);
    const totalStreams = streamsResult.length > 0 ? streamsResult[0].totalStreams : 0;

    return NextResponse.json({
      songs: formattedSongs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        totalStreams,
      },
    });
  } catch (error) {
    console.error('Get lofi songs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lofi songs' },
      { status: 500 }
    );
  }
}

// POST new lofi song (protected)
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

    const song = await LofiSong.create({
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
    console.error('Create lofi song error:', error);
    return NextResponse.json(
      { error: 'Failed to create lofi song' },
      { status: 500 }
    );
  }
}
