// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const RESET_EXPIRES_IN = "1h"; // token valid for 1 hour

// Generate JWT
const generateToken = (userId: string, role: string) => {
  // Type assertion for JWT_SECRET to make TS happy
  const secret: jwt.Secret = JWT_SECRET;

  const payload = { id: userId, role };
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

  return jwt.sign(payload, secret, options);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, vehicleInfo } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    let userData: any = { name, email: email.toLowerCase(), password, role };
    if (role === "driver") {
      if (!vehicleInfo)
        return res
          .status(400)
          .json({ message: "Vehicle info required for drivers" });
      userData.vehicleInfo = vehicleInfo;
      userData.approvalStatus = "pending";
      userData.isOnline = false;
    }

    const user: any = new User(userData);
    await user.save();

    user.password = undefined;

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user: any = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    user.password = undefined;
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Create a reset token
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: RESET_EXPIRES_IN,
  });

  // Normally you'd email this token. For now return it in response
  res.status(200).json({ message: "Reset token generated", token });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET); // throws if invalid/expired
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT || 10));
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


