
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SongSuggestion from '@/models/SongSuggestion';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // In a real app, verify Admin/Super Admin role here using cookies/headers
    // For now assuming existing middleware/checks or simple fetch
    
    // Fetch pending suggestions sorted by count (popularity) desc
    const suggestions = await SongSuggestion.find({ status: 'pending' })
      .sort({ count: -1, createdAt: -1 });
      
    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
