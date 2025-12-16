import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

// PUT update song (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, artist, cover, audio, color } = body;

    await dbConnect();

    const song = await Song.findByIdAndUpdate(
      id,
      { name, artist, cover, audio, color },
      { new: true, runValidators: true }
    );

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

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
      },
    });
  } catch (error) {
    console.error('Update song error:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

// DELETE song (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.valid) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    await dbConnect();

    const song = await Song.findByIdAndDelete(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Song deleted successfully',
    });
  } catch (error) {
    console.error('Delete song error:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}
