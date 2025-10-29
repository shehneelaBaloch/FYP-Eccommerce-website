// lib/model/Profile.ts
import mongoose, { Schema, models, Document } from "mongoose";

export interface IProfile extends Document {
  userId: string;
  phone?: string;
  imageUrl?: string;
  addresses: Array<{
    fullName: string;
    contact: string;
    address: string;
    city: string;
    postal: string;
    isDefault: boolean;
  }>;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true },
    phone: { type: String },
    imageUrl: { type: String },
    addresses: [{
      fullName: { type: String, required: true },
      contact: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postal: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

const Profile = models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;