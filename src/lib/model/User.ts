import mongoose, { Schema, models, Document } from "mongoose";

// Address Schema
const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

export interface IAddress {
  fullName: string;
  contact: string;
  address: string;
  city: string;
  postal: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  phone?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    phone: { type: String },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;