import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { FocusEvent } from "../models/FocusEvent";
import { FocusSession } from "../models/FocusSession";
import { StudyTask } from "../models/StudyTask";
import { WeeklyPlan } from "../models/WeeklyPlan";

const router = Router();

router.post(
  "/push",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        res.status(400).json({ message: "items array is required" });
        return;
      }

      const results: Array<{
        entityType: string;
        entityId: string;
        status: string;
      }> = [];

      for (const item of items) {
        try {
          const { entityType, entityId, operation, payload } = item;

          switch (entityType) {
            case "focus_session":
              if (operation === "create") {
                await FocusSession.create({
                  ...payload,
                  userId: req.user!._id,
                });
              } else if (operation === "update") {
                await FocusSession.findOneAndUpdate(
                  { _id: entityId, userId: req.user!._id },
                  payload,
                );
              }
              break;
            case "focus_event":
              if (operation === "create") {
                await FocusEvent.create({ ...payload, sessionId: entityId });
              }
              break;
            case "study_task":
              if (operation === "create") {
                await StudyTask.create({ ...payload, userId: req.user!._id });
              } else if (operation === "update") {
                await StudyTask.findOneAndUpdate(
                  { _id: entityId, userId: req.user!._id },
                  payload,
                );
              } else if (operation === "delete") {
                await StudyTask.findOneAndDelete({
                  _id: entityId,
                  userId: req.user!._id,
                });
              }
              break;
            case "weekly_plan":
              if (operation === "create") {
                await WeeklyPlan.create({ ...payload, userId: req.user!._id });
              } else if (operation === "update") {
                await WeeklyPlan.findOneAndUpdate(
                  { _id: entityId, userId: req.user!._id },
                  payload,
                );
              }
              break;
          }

          results.push({ entityType, entityId, status: "ok" });
        } catch (err) {
          results.push({
            entityType: item.entityType,
            entityId: item.entityId,
            status: "error",
          });
        }
      }

      res.json({ results, syncedAt: Date.now() });
    } catch (error) {
      res.status(500).json({ message: "Sync failed" });
    }
  },
);

router.post(
  "/pull",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { lastSyncAt } = req.body;
      const since = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
      if (Number.isNaN(since.getTime())) {
        res
          .status(400)
          .json({ message: "lastSyncAt must be a valid timestamp" });
        return;
      }

      const sessions = await FocusSession.find({
        userId: req.user!._id,
        updatedAt: { $gte: since },
      });
      const tasks = await StudyTask.find({
        userId: req.user!._id,
        updatedAt: { $gte: since },
      });
      const plans = await WeeklyPlan.find({
        userId: req.user!._id,
        updatedAt: { $gte: since },
      });

      res.json({
        sessions,
        tasks,
        plans,
        pulledAt: Date.now(),
      });
    } catch (error) {
      res.status(500).json({ message: "Pull failed" });
    }
  },
);

export default router;
