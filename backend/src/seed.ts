import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { WeeklyPlan } from "./models/WeeklyPlan";
import { StudyTask } from "./models/StudyTask";

dotenv.config();

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getOffsetDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB!");

  const studentEmail = "bae@neet.co";
  const studentPassword = await bcrypt.hash("neet2027", 12);
  const partnerEmail = "tasavvuf@ldr.com";
  const partnerPassword = await bcrypt.hash("partner123", 12);

  await User.deleteMany({ email: { $in: [studentEmail, partnerEmail, "simran@neet.com"] } });

  const student = await User.create({
    name: "Bae",
    email: studentEmail,
    password: studentPassword,
    role: "student",
    inviteCode: "NEET2027",
    timezone: "Asia/Kolkata",
  });

  const partner = await User.create({
    name: "Tasavvuf",
    email: partnerEmail,
    password: partnerPassword,
    role: "partner",
    partnerId: student._id,
    timezone: "Asia/Kolkata",
  });

  student.partnerId = partner._id as any;
  await student.save();

  console.log(`Created Student: ${student.name} (${student.email})`);
  console.log(`Created Partner: ${partner.name} (${partner.email}) - Paired with Student!`);

  await WeeklyPlan.deleteMany({ userId: student._id });
  await StudyTask.deleteMany({ userId: student._id });

  const todayStr = getTodayDateStr();
  const weekStartStr = getOffsetDateStr(0);
  const weekEndStr = getOffsetDateStr(6);

  const plan = await WeeklyPlan.create({
    userId: student._id,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    status: "locked",
    lockedAt: new Date(),
  });

  console.log(`Created Locked Weekly Plan for week: ${weekStartStr} to ${weekEndStr}`);

  const tasksData = [
    {
      planId: plan._id,
      userId: student._id,
      title: "Human Physiology",
      subject: "Biology",
      description: "Digestion, Respiration and Body Fluids NCERT Review",
      date: todayStr,
      startTime: "07:00",
      endTime: "09:00",
      targetMinutes: 120,
      priority: "high",
      status: "completed",
      completionThreshold: 0.8,
      distractingApps: ["Instagram", "WhatsApp", "YouTube"],
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Thermodynamics & Heat",
      subject: "Physics",
      description: "Formulas, Carnot cycle and PYQ practice (2018-2024)",
      date: todayStr,
      startTime: "10:00",
      endTime: "12:00",
      targetMinutes: 120,
      priority: "high",
      status: "active",
      completionThreshold: 0.8,
      distractingApps: ["Instagram", "WhatsApp", "YouTube"],
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Organic Reaction Mechanisms",
      subject: "Chemistry",
      description: "Electrophilic substitution, Aldehydes & Ketones",
      date: todayStr,
      startTime: "14:00",
      endTime: "16:00",
      targetMinutes: 120,
      priority: "medium",
      status: "planned",
      completionThreshold: 0.8,
      distractingApps: ["Instagram", "WhatsApp", "YouTube"],
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Daily NCERT Question Bank",
      subject: "Revision",
      description: "100 PYQ Speed Run & Error notebook update",
      date: todayStr,
      startTime: "20:00",
      endTime: "21:00",
      targetMinutes: 60,
      priority: "low",
      status: "planned",
      completionThreshold: 0.8,
      distractingApps: ["Instagram", "WhatsApp", "YouTube"],
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Mechanics & Newton's Laws",
      subject: "Physics",
      description: "Friction, circular motion, energy theorems",
      date: getOffsetDateStr(1),
      startTime: "08:00",
      endTime: "10:00",
      targetMinutes: 120,
      priority: "high",
      status: "planned",
      completionThreshold: 0.8,
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Genetics & Molecular Inheritance",
      subject: "Biology",
      description: "DNA replication, transcription, Mendelian crosses",
      date: getOffsetDateStr(1),
      startTime: "11:00",
      endTime: "13:00",
      targetMinutes: 120,
      priority: "high",
      status: "planned",
      completionThreshold: 0.8,
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Coordination Compounds",
      subject: "Chemistry",
      description: "CFT, isomerism and nomenclature practice",
      date: getOffsetDateStr(1),
      startTime: "15:00",
      endTime: "17:00",
      targetMinutes: 120,
      priority: "medium",
      status: "planned",
      completionThreshold: 0.8,
    },
    {
      planId: plan._id,
      userId: student._id,
      title: "Cell Biology & Cell Division",
      subject: "Biology",
      description: "Mitosis, meiosis, cell organelles checklist",
      date: getOffsetDateStr(2),
      startTime: "09:00",
      endTime: "11:00",
      targetMinutes: 120,
      priority: "high",
      status: "planned",
      completionThreshold: 0.8,
    },
  ];

  await StudyTask.insertMany(tasksData);
  console.log(`Created ${tasksData.length} Re-NEET tasks in MongoDB!`);

  console.log("\nDatabase seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Student Login:  bae@neet.co / neet2027");
  console.log("Partner Login:  tasavvuf@ldr.com / partner123");
  console.log("Invite Code:    NEET2027");
  console.log("-----------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
