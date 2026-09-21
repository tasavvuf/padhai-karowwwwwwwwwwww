import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "partner";
  timezone: string;
  partnerId?: mongoose.Types.ObjectId;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "partner"], required: true },
    timezone: { type: String, default: "UTC" },
    partnerId: { type: Schema.Types.ObjectId, ref: "User" },
    inviteCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
