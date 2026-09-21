import mongoose, { Schema, Document } from "mongoose";

export interface IWeeklyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  weekStart: string;
  weekEnd: string;
  status: "draft" | "ready" | "locked" | "active" | "completed";
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: String, required: true },
    weekEnd: { type: String, required: true },
    status: { type: String, enum: ["draft", "ready", "locked", "active", "completed"], default: "draft" },
    lockedAt: Date,
  },
  { timestamps: true }
);

weeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export const WeeklyPlan = mongoose.model<IWeeklyPlan>("WeeklyPlan", weeklyPlanSchema);
