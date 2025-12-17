import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppVersion extends Document {
  version: string;
  minVersion: string;
  changelog: string;
  androidUrl: string;
  iosUrl?: string; // Future proofing
  forceUpdate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppVersionSchema = new Schema<IAppVersion>(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    minVersion: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    changelog: {
      type: String,
      default: '',
    },
    androidUrl: {
      type: String,
      required: true,
      default: '/android-app.apk',
    },
    iosUrl: {
      type: String,
      required: false,
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AppVersion: Model<IAppVersion> = mongoose.models.AppVersion || mongoose.model<IAppVersion>('AppVersion', AppVersionSchema);

export default AppVersion;
