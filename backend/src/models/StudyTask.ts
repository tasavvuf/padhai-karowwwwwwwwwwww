import mongoose, { Schema, Document } from "mongoose";

export interface IStudyTask extends Document {
  planId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  targetMinutes: number;
  category?: string;
  priority: "low" | "medium" | "high";
  status: "planned" | "available" | "active" | "completed" | "missed" | "expired";
  completionThreshold: number;
  allowedApps?: string[];
  distractingApps?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studyTaskSchema = new Schema<IStudyTask>(
  {
    planId: { type: Schema.Types.ObjectId, ref: "WeeklyPlan", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: String,
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    targetMinutes: { type: Number, required: true },
    category: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["planned", "available", "active", "completed", "missed", "expired"], default: "planned" },
    completionThreshold: { type: Number, default: 0.9 },
    allowedApps: [String],
    distractingApps: [String],
  },
  { timestamps: true }
);

studyTaskSchema.index({ userId: 1, date: 1 });
studyTaskSchema.index({ planId: 1 });

export const StudyTask = mongoose.model<IStudyTask>("StudyTask", studyTaskSchema);
