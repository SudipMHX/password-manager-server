import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateSalt,
  encryptData,
  decryptData,
  deriveKey,
} from "../utils/crypto.js";
import { protect } from "../middleware/auth.js";
import Vaults from "../models/Vaults.js";

const router = express.Router();

// 👤 Register : new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const email_hash = deriveKey(email);
    const existingUser = await User.findOne({ userId: email_hash });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const encryption_salt = generateSalt();
    const encryption_key = deriveKey(encryption_salt);

    const encryptedName = encryptData(name, encryption_key);
    const encryptedEmail = encryptData(email.toLowerCase(), encryption_key);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: encryptedName,
      email: encryptedEmail,
      userId: email_hash,
      password: hashedPassword,
      encryption_salt: encryption_salt,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// 🙍‍♂️ Login : existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const email_hash = deriveKey(email);
    const user = await User.findOne({ userId: email_hash });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// 🆕 Update user info : (name, email, avatar, password)
router.put("/update", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { name, email, avatar, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const encryption_key = deriveKey(user.encryption_salt);

    // Update name
    if (name) {
      user.name = encryptData(name, encryption_key);
    }

    // Update email
    if (email) {
      const email_hash = deriveKey(email);
      const existing = await User.findOne({ userId: email_hash });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = encryptData(email.toLowerCase(), encryption_key);
      user.userId = email_hash;
    }

    // Update avatar
    if (avatar) {
      user.avatar = avatar;
    }

    // Update password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
    }

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ❌ Delete user account and all data
router.delete("/delete", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete all vault entries
    await Vaults.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account and all data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✨ : Get current user data
router.get("/me", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const encryption_key = deriveKey(user.encryption_salt);
    const name = decryptData(user.name, encryption_key);
    const email = decryptData(user.email, encryption_key);

    res.json({
      id: user._id,
      userId: user.userId,
      name: name,
      email: email,
      avatar: user.avatar,
      verified: user.verified,
      passwordChangedAt: user.passwordChangedAt,
    });
  } catch (error) {
    console.error("Fetch Me Error:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
