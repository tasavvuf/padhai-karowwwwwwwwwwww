import { Router, Response } from "express";
import { FocusSession } from "../models/FocusSession";
import { FocusEvent } from "../models/FocusEvent";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, limit } = req.query;
    const query: Record<string, unknown> = { userId: req.user!._id };
    const sessions = await FocusSession.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 20);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

router.get("/active", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await FocusSession.findOne({
      userId: req.user!._id,
      status: { $in: ["active", "paused", "interrupted"] },
    }).sort({ createdAt: -1 });
    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active session" });
  }
});

router.post("/", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await FocusSession.create({
      ...req.body,
      userId: req.user!._id,
      actualStart: Date.now(),
    });
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: "Failed to create session" });
  }
});

router.put("/:id", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }
    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: "Failed to update session" });
  }
});

router.put("/:id/complete", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      {
        status: "completed",
        actualEnd: Date.now(),
        ...req.body,
      },
      { new: true }
    );
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }
    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete session" });
  }
});

router.post("/:id/sync", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = Array.isArray(req.body) ? req.body : req.body?.events || [];
    if (events.length > 0) {
      await FocusEvent.insertMany(
        events.map((e: any) => ({
          ...e,
          sessionId: req.params.id,
        }))
      );
    }
    res.json({ message: "Events synced" });
  } catch (error) {
    res.status(500).json({ message: "Failed to sync events" });
  }
});

router.post("/:id/events", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await FocusEvent.create({
      ...req.body,
      sessionId: req.params.id,
    });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.get("/:id/events", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await FocusEvent.find({ sessionId: req.params.id }).sort({ timestamp: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

export default router;
