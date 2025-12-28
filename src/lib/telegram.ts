
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
// Use ngrok url strictly for callback buttons if needed, or just standard app url if hosted
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not defined');
}

if (!TELEGRAM_ADMIN_CHAT_ID) {
  console.warn('TELEGRAM_ADMIN_CHAT_ID is not defined');
}

interface SongSuggestion {
    _id: string;
    name: string;
    artist: string;
    cover: string;
    audio: string;
    jiosaavnId?: string;
}

export async function sendSuggestionNotification(suggestion: SongSuggestion) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return;

    const message = `
🎵 *New Song Suggestion*

*Name:* ${suggestion.name}
*Artist:* ${suggestion.artist}
*ID:* \`${suggestion.jiosaavnId || 'Local'}\`

[Cover Image](${suggestion.cover})
    `;

    // Construct inline keyboard with Approve/Reject buttons
    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ Approve', callback_data: `approve_${suggestion._id}` },
                { text: '❌ Reject', callback_data: `reject_${suggestion._id}` }
            ],
            [
                { text: '🎧 Listen to Track', url: suggestion.audio }
            ]
        ]
    };

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }),
        });

        const data = await response.json();
        if (!data.ok) {
            console.error('Failed to send Telegram notification:', data);
        } else {
            console.log('Telegram notification sent successfully');
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

export async function editMessageText(chatId: number | string, messageId: number, text: string) {
     if (!TELEGRAM_BOT_TOKEN) return;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 chat_id: chatId,
                 message_id: messageId,
                 text: text,
                 parse_mode: 'Markdown'
             })
        });
    } catch (error) {
         console.error('Error editing Telegram message:', error);
    }
}
