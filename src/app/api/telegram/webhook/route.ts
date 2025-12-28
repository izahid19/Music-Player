
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SongSuggestion from '@/models/SongSuggestion';
import Song from '@/models/Song';
import { editMessageText } from '@/lib/telegram';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const update = await request.json();

        // Handle Callback Queries (Button Clicks)
        if (update.callback_query) {
            const { message, data, from } = update.callback_query;
            const chatId = message.chat.id;
            const messageId = message.message_id;

            const [action, suggestionId] = data.split('_');

            if (!suggestionId) {
                 return NextResponse.json({ ok: true });
            }

            const suggestion = await SongSuggestion.findById(suggestionId);

            if (action === 'approve') {
                if (!suggestion) {
                    await editMessageText(chatId, messageId, `⚠️ Suggestion not found (maybe already processed).`);
                    return NextResponse.json({ ok: true });
                }

                // Check for existing song
                const existing = await Song.findOne({ audio: suggestion.audio });
                if (!existing) {
                    await Song.create({
                        name: suggestion.name,
                        artist: suggestion.artist,
                        cover: suggestion.cover,
                        audio: suggestion.audio,
                        color: suggestion.color,
                        playCount: suggestion.count || 1, 
                        addedBy: `telegram_${from.first_name}`,
                        active: true
                    });
                }

                // Delete suggestion
                await SongSuggestion.findByIdAndDelete(suggestionId);

                // Update Telegram Message
                await editMessageText(chatId, messageId, `✅ *Approved* by ${from.first_name}\n\n🎵 ${suggestion.name} - ${suggestion.artist}`);

            } else if (action === 'reject') {
                if (suggestion) {
                    await SongSuggestion.findByIdAndDelete(suggestionId);
                }
                 // Update Telegram Message
                 const songName = suggestion ? `${suggestion.name} - ${suggestion.artist}` : 'Song';
                 await editMessageText(chatId, messageId, `❌ *Rejected* by ${from.first_name}\n\n🎵 ${songName}`);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error in Telegram Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
