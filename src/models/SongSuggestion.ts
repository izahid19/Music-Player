import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISongSuggestion extends Document {
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  jiosaavnId?: string;
  count: number; // How many times played/suggested
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const SongSuggestionSchema = new Schema<ISongSuggestion>(
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
    },
    jiosaavnId: {
      type: String,
      required: false,
    },
    count: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const SongSuggestion: Model<ISongSuggestion> = mongoose.models.SongSuggestion || mongoose.model<ISongSuggestion>('SongSuggestion', SongSuggestionSchema);

export default SongSuggestion;
