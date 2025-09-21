import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string; // from NextAuth session
  phone?: string;
  address?: string;
  imageUrl?: string;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
