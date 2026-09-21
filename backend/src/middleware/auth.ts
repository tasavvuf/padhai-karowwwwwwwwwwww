import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "padhaikarow-dev-secret-key";

export interface AuthRequest extends Request {
  user?: IUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    User.findById(decoded.userId).then((user) => {
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      req.user = user;
      next();
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(role: "student" | "partner") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ message: `Access denied. Required role: ${role}` });
      return;
    }
    next();
  };
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
