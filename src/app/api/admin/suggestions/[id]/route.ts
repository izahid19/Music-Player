
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SongSuggestion from '@/models/SongSuggestion';
import Song from '@/models/Song';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    // Await params for Next.js 15+
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();
    const { action } = body;

    if (action !== 'approve') {
       return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const suggestion = await SongSuggestion.findById(id);
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // Create Song
    // Check duplication again just in case
    const existing = await Song.findOne({ audio: suggestion.audio });
    if (!existing) {
        await Song.create({
            name: suggestion.name,
            artist: suggestion.artist,
            cover: suggestion.cover,
            audio: suggestion.audio,
            color: suggestion.color,
            playCount: suggestion.count || 1, 
            addedBy: 'jiosaavn_suggestion',
            active: true
        });
    }

    // Remove suggestion
    await SongSuggestion.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (error) {
     console.error('Error approving suggestion:', error);
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        await SongSuggestion.findByIdAndDelete(id);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rejecting suggestion:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
