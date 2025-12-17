
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { songId } = await request.json();

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    const song = await Song.findByIdAndUpdate(
      songId,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, count: song.playCount });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
