
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Song from '@/models/Song';

interface JioSaavnSongData {
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  source?: string;
  jiosaavnId?: string;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { songId, jiosaavnSong } = body;

    // If it's a JioSaavn song, save it to database first
    const isJioSaavnSong = songId?.startsWith('jiosaavn_');
    
    if (isJioSaavnSong && jiosaavnSong) {
      // Extract the ID (remove prefix)      
      // Check if this JioSaavn song already exists in database (by audio URL or jiosaavn ID)
      let existingSong = await Song.findOne({
        $or: [
          { audio: jiosaavnSong.audio },
          { name: jiosaavnSong.name, artist: jiosaavnSong.artist }
        ]
      });

      if (existingSong) {
        // Song exists, just increment play count
        existingSong.playCount += 1;
        await existingSong.save();
        return NextResponse.json({ 
          success: true, 
          count: existingSong.playCount,
          songId: existingSong._id.toString(),
          isNew: false
        });
      } else {
        // Song doesn't exist in main DB, check suggestions logic
        // Import SongSuggestion model - dynamically if needed or at top, effectively doing it here for clarity in replacement
        // Note: I will add the import at the top in a separate edit or assume it's available? 
        // No, I must add the import first. I'll split this into two edits or just do one big replace if possible.
        // Actually I can't add import at top easily with this tool without checking lines.
        // I'll stick to logic here, and add import statement separate.
        
        // Find existing suggestion
        const SongSuggestion = (await import('@/models/SongSuggestion')).default;
        
        let existingSuggestion = await SongSuggestion.findOne({
            $or: [
              { audio: jiosaavnSong.audio },
              { name: jiosaavnSong.name, artist: jiosaavnSong.artist }
            ]
        });

        if (existingSuggestion) {
             existingSuggestion.count += 1;
             await existingSuggestion.save();
        } else {
             // Create new suggestion
             await SongSuggestion.create({
              name: jiosaavnSong.name,
              artist: jiosaavnSong.artist,
              cover: jiosaavnSong.cover,
              audio: jiosaavnSong.audio,
              color: jiosaavnSong.color || ['#667eea', '#764ba2'],
              jiosaavnId: songId,
              count: 1,
              status: 'pending'
            });
        }

        // Return success but NO songId (so frontend keeps treating it as external)
        return NextResponse.json({ 
          success: true, 
          isSuggestion: true
        });
      }
    }

    // Regular local song - just increment play count
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

