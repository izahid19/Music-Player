
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';

export async function GET() {
  try {
    await dbConnect();
    
    // Update all songs that don't have a playCount field
    const result = await Song.updateMany(
      { playCount: { $exists: false } }, // Find missing
      { $set: { playCount: 0 } }         // Set to 0
    );

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} songs with playCount: 0`,
      details: result
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
