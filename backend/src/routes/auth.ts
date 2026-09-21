import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User";
import { authenticate, generateToken, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, inviteCode } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "Name, email, password, and role are required" });
      return;
    }

    if (!["student", "partner"].includes(role)) {
      res.status(400).json({ message: "Role must be 'student' or 'partner'" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const inviteCodeGenerated = role === "student" ? uuidv4().slice(0, 8).toUpperCase() : undefined;

    let partnerId = undefined;
    if (role === "partner" && inviteCode) {
      const student = await User.findOne({ inviteCode, role: "student" });
      if (student) {
        partnerId = student._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      inviteCode: inviteCodeGenerated,
      partnerId,
    });

    if (partnerId) {
      await User.findByIdAndUpdate(partnerId, { partnerId: user._id });
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        inviteCode: user.inviteCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: (error as Error).message });
  }
});

router.post("/login", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        inviteCode: user.inviteCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: (error as Error).message });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        inviteCode: user.inviteCode,
        partnerId: user.partnerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user" });
  }
});

export default router;
