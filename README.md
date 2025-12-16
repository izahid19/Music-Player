# 🎵 Playyly - Music Player

A modern, full-stack music player application built with Next.js, featuring an admin dashboard for music management and a beautiful player interface.

![Music Player](https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop)

## ✨ Features

### Player
- 🎧 Clean, modern music player interface
- 🔀 Shuffle and repeat modes (off, all, one)
- 🔊 Volume control with mute toggle
- ❤️ Favorites system
- 🔍 Search songs in library
- ⌨️ Keyboard shortcuts (Space, Arrow keys, M)
- 🌓 Light/Dark theme support
- 📱 Fully responsive design

### Admin Dashboard
- 🎵 Upload and manage songs
- 📊 Paginated song list with search
- 🖼️ Default cover image picker (Unsplash)
- 📈 Upload progress indicator
- 🔐 OTP-based authentication
- 🌓 Light/Dark theme toggle

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: SCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose)
- **Storage**: Cloudinary (audio files)
- **Auth**: JWT + OTP via Email
- **Icons**: FontAwesome

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- MongoDB database
- Cloudinary account

### Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/music-player.git
cd music-player

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── music/page.tsx     # Music player
│   ├── admin/
│   │   ├── login/         # Admin login
│   │   └── dashboard/     # Song management
│   └── api/
│       ├── songs/         # Songs CRUD
│       ├── upload/        # File upload
│       └── auth/          # Authentication
├── components/
│   ├── Player.tsx         # Player controls
│   ├── Song.tsx           # Current song display
│   ├── Library.tsx        # Song library sidebar
│   └── Nav.tsx            # Navigation
├── styles/
│   ├── app.scss           # Global styles
│   ├── _player.scss       # Player styles
│   ├── _library.scss      # Library styles
│   └── _admin.scss        # Admin dashboard styles
└── models/
    └── Song.ts            # MongoDB Song model
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next track |
| `←` | Previous track |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Toggle mute |

## 📜 Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

## 🌐 Deployment

The app is ready for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 📄 License

MIT License - feel free to use this project for learning or personal use.

---

Made with ❤️ using Next.js
