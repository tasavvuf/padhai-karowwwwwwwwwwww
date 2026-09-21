import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import planRoutes from "./routes/plans";
import taskRoutes from "./routes/tasks";
import sessionRoutes from "./routes/sessions";
import partnerRoutes from "./routes/partner";
import progressRoutes from "./routes/progress";
import syncRoutes from "./routes/sync";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/sync", syncRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
