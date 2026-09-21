import mongoose, { Document, Schema } from "mongoose";

export interface IPartnerMessage extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  message: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const partnerMessageSchema = new Schema<IPartnerMessage>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 280 },
    readAt: Date,
  },
  { timestamps: true },
);

partnerMessageSchema.index({ toUserId: 1, createdAt: -1 });

export const PartnerMessage = mongoose.model<IPartnerMessage>(
  "PartnerMessage",
  partnerMessageSchema,
);
