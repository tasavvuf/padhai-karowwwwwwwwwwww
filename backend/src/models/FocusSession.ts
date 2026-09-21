import mongoose, { Schema, Document } from "mongoose";

export interface IFocusSession extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "active" | "paused" | "interrupted" | "completed" | "expired" | "failed";
  plannedStart: number;
  plannedEnd: number;
  actualStart?: number;
  actualEnd?: number;
  totalFocusedMs: number;
  totalInterruptedMs: number;
  interruptionCount: number;
  completionPercentage: number;
  monitoringValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const focusSessionSchema = new Schema<IFocusSession>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "StudyTask", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "paused", "interrupted", "completed", "expired", "failed"], default: "active" },
    plannedStart: { type: Number, required: true },
    plannedEnd: { type: Number, required: true },
    actualStart: Number,
    actualEnd: Number,
    totalFocusedMs: { type: Number, default: 0 },
    totalInterruptedMs: { type: Number, default: 0 },
    interruptionCount: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    monitoringValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, createdAt: -1 });
focusSessionSchema.index({ taskId: 1 });

export const FocusSession = mongoose.model<IFocusSession>("FocusSession", focusSessionSchema);
