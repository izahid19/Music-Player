import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';
import { verifyAdminToken, unauthorizedResponse } from '@/lib/auth';

// PUT update song (protected - only owner or super_admin can edit)
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
    const { name, artist, cover, audio, color, playCount } = body;

    await dbConnect();

    // First, find the song to check ownership
    const existingSong = await Song.findById(id);
    
    if (!existingSong) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Check permissions: only owner or super_admin can edit
    const isOwner = existingSong.addedBy === auth.email;
    const isSuperAdmin = auth.role === 'super_admin';
    
    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'You can only edit songs that you added' },
        { status: 403 }
      );
    }

    const song = await Song.findByIdAndUpdate(
      id,
      { name, artist, cover, audio, color, playCount },
      { new: true, runValidators: true }
    );

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
    console.error('Update song error:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

// DELETE song (protected - admins can delete their own, super_admin can delete any)
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

    // First, find the song to check ownership
    const song = await Song.findById(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Check permissions: owner can delete their own, super_admin can delete any
    const isOwner = song.addedBy === auth.email;
    const isSuperAdmin = auth.role === 'super_admin';
    
    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'You can only delete songs that you added' },
        { status: 403 }
      );
    }

    await Song.findByIdAndDelete(id);

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
