import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISong extends Document {
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;
  addedBy: string; // Email of admin who added this song
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<ISong>(
  {
    name: {
      type: String,
      required: [true, 'Song name is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    cover: {
      type: String,
      required: [true, 'Cover image URL is required'],
    },
    audio: {
      type: String,
      required: [true, 'Audio URL is required'],
    },
    color: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 2,
        message: 'Color must have exactly 2 values (primary and secondary)',
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: String,
      required: false, // Optional for backwards compatibility with existing songs
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>('Song', SongSchema);

export default Song;
