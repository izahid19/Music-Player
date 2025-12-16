/**
 * Migration Script: Upload songs to Cloudinary and seed MongoDB
 * 
 * Run with: npx ts-node --esm scripts/migrate-songs.ts
 * Or add to package.json: "migrate": "ts-node scripts/migrate-songs.ts"
 */

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configuration (copy from .env.local)
const MONGODB_URI = "mongodb+srv://mushtaqzahid888_db_user:sDm0iCf1PO57g8Sl@learnbackend.d54y1dj.mongodb.net/playly";
const CLOUDINARY_CLOUD_NAME = "dnh1sleli";
const CLOUDINARY_API_KEY = "179739832163836";
const CLOUDINARY_API_SECRET = "aDo74uv0Y30lhiKzb_4DaUzzX3g";

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Song Schema (inline for script)
const SongSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: true },
  audio: { type: String, required: true },
  color: { type: [String], required: true },
  active: { type: Boolean, default: false },
}, { timestamps: true });

const Song = mongoose.models.Song || mongoose.model('Song', SongSchema);

// Existing songs data (from util.ts)
const songsData = [
  {
    name: 'Challa',
    cover: 'https://cover.mr-jatt.im/thumb/504208/Challa-1.jpg',
    artist: 'Gurdas Maan ft Diljit Dosanjh',
    localFile: 'Challa.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Moosa Mashup (Tribute To Sidhu)',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    artist: 'SIdhu Moose Wala',
    localFile: 'MoosaMashup.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Baller',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_orchard/music/20220825055753_196925634489/1661422519/srch_orchard_196925634489_QMBZ92275950.jpg',
    artist: 'Shubh',
    localFile: 'Baller.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'NO LOVE',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_believe/music/0196776912972/1656859807/srch_believe_A10320WT042924992Y.jpg',
    artist: 'Shubh',
    localFile: 'nolove.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'We Rollin',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_believe/music/0196400716495/1656861613/srch_believe_A10320WT0429249910.jpg',
    artist: 'Shubh',
    localFile: 'werollin.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Pagol (Slowed + Reverbed)',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/music/1562531793/srch_abcdigital_CA3SS1932001.jpg',
    artist: 'Deep Jandu Ft Bohemia',
    localFile: 'Pagol.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'Her',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3.ap-south-1.amazonaws.com/wynk-music-cms/srch_orchard/20221116050505_197187463015/1668593505007/resources/197187463015.jpg',
    artist: 'Shubh',
    localFile: 'her.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'Tibeyan Da Putt',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_onedigital/music/810059342408/1628765172/srch_onedigital_810059342408_INU251900415.jpg',
    artist: 'Sidhu Moose Wala',
    localFile: 'TibbeyanDaPutt.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: '295',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'Sidhu Moose Wala',
    localFile: 'SS295.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'These Days',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'SIdhu Moose Wala ft Bohemia',
    localFile: 'TheseDays.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'Us',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'SIdhu Moose Wala ft Raja Kumari',
    localFile: 'US.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'G-Shit',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'SIdhu Moose Wala',
    localFile: 'GShit.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'Celebrity Killer',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'SIdhu Moose Wala',
    localFile: 'CelebrityKiller.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'Built Different',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'Sidhu Moose Wala',
    localFile: 'BuiltDifferent.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Me and My GirlFriend',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'Sidhu Moose Wala',
    localFile: 'MeandMyGf.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'Racks and Rounds',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_hungama/music/810063889609/1628580662/srch_hungama_69279611.jpg',
    artist: 'SIdhu Moose Wala ft Sikandar Khalon',
    localFile: 'RackAndRound.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'The Last Ride',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_onedigital/music/update/810105712582/1652793006/srch_onedigital_810105712582_INU252204113.jpg',
    artist: 'SIdhu Moose Wala',
    localFile: 'TheLastRide.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'Level',
    cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_onedigital/music/810105713220/1653455406/srch_onedigital_810105713220_INU252204222.jpg',
    artist: 'SIdhu Moose Wala ft Sunny Malton',
    localFile: 'Levels.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'Pasoori',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    artist: 'Ali Sethi, Shae Gill',
    localFile: 'Pasoori.mp3',
    color: ['#205950', '#2ab3bf'],
  },
  {
    name: 'Phir Milengy',
    cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
    artist: 'Faisal Kapadia, Young Stunner',
    localFile: 'PhirMilenge.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'GO',
    cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop',
    artist: 'Atif Aslam, Abdullah Siddiqui',
    localFile: 'GO.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Thagyan',
    cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
    artist: 'Quratulain Balouch, Zain Zohaib',
    localFile: 'Thagyan.mp3',
    color: ['#EF8EA9', '#ab417f'],
  },
  {
    name: 'Peechay Hutt',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',
    artist: 'Talal Qureshi',
    localFile: 'PeechayHutt.mp3',
    color: ['#CD607D', '#c94043'],
  },
  {
    name: 'Yeh Dunya',
    cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    artist: 'Talha Anjum',
    localFile: 'YeDunya.mp3',
    color: ['#205950', '#2ab3bf'],
  },
];

async function uploadToCloudinary(filePath: string, fileName: string): Promise<string> {
  console.log(`  Uploading ${fileName}...`);
  
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video', // for audio files
    folder: 'playly/songs',
    public_id: fileName.replace('.mp3', ''),
  });
  
  console.log(`  ✓ Uploaded: ${result.secure_url}`);
  return result.secure_url;
}

async function migrate() {
  console.log('🎵 Playly Migration Script\n');
  console.log('Connecting to MongoDB...');
  
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB\n');

  // Clear existing songs
  console.log('Clearing existing songs...');
  await Song.deleteMany({});
  console.log('✓ Cleared\n');

  const musicDir = path.join(process.cwd(), 'public', 'music');
  
  console.log('Starting migration...\n');

  for (let i = 0; i < songsData.length; i++) {
    const song = songsData[i];
    console.log(`[${i + 1}/${songsData.length}] ${song.name}`);
    
    const filePath = path.join(musicDir, song.localFile);
    
    let audioUrl: string;
    
    // Check if file exists locally
    if (fs.existsSync(filePath)) {
      audioUrl = await uploadToCloudinary(filePath, song.localFile);
    } else {
      console.log(`  ⚠ File not found locally, using placeholder`);
      audioUrl = `/music/${song.localFile}`; // fallback to local path
    }
    
    // Create song in database
    await Song.create({
      name: song.name,
      artist: song.artist,
      cover: song.cover,
      audio: audioUrl,
      color: song.color,
      active: i === 0,
    });
    
    console.log(`  ✓ Added to database\n`);
  }

  console.log('✅ Migration complete!');
  console.log(`   Total songs migrated: ${songsData.length}`);
  
  await mongoose.disconnect();
  console.log('   Disconnected from MongoDB');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
