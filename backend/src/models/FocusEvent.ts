import mongoose, { Schema, Document } from "mongoose";

export interface IFocusEvent extends Document {
  sessionId: mongoose.Types.ObjectId;
  eventType: "start" | "pause" | "resume" | "end" | "interruption_start" | "interruption_end";
  timestamp: number;
  appPackage?: string;
  appName?: string;
  metadata?: string;
  createdAt: Date;
}

const focusEventSchema = new Schema<IFocusEvent>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "FocusSession", required: true },
    eventType: { type: String, enum: ["start", "pause", "resume", "end", "interruption_start", "interruption_end"], required: true },
    timestamp: { type: Number, required: true },
    appPackage: String,
    appName: String,
    metadata: String,
  },
  { timestamps: true }
);

focusEventSchema.index({ sessionId: 1, timestamp: 1 });

export const FocusEvent = mongoose.model<IFocusEvent>("FocusEvent", focusEventSchema);
