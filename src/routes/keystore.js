import express from "express";
import { protect } from "../middleware/auth.js";
import Vaults from "../models/Vaults.js";
import User from "../models/User.js";
import { encryptData, decryptData, deriveKey } from "../utils/crypto.js";

const router = express.Router();

// 🔐 Helper: Get user's encryption key
const getEncryptionKey = (user) => {
  return deriveKey(user.encryption_salt);
};

// 📥 Create new vault entry
router.post("/", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { app, email, username, password, authenticator } = req.body?.data;

    if (!app || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const key = getEncryptionKey(user);

    const data = {
      app: encryptData(app, key),
      email: encryptData(email, key),
      username: encryptData(username, key),
      password: encryptData(password, key),
      authenticator: encryptData(authenticator || "", key),
    };

    const entry = await Vaults.create({ userId, data });
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 📤 Get all vault entries (decrypted)
router.get("/", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const key = getEncryptionKey(user);
    const entries = await Vaults.find({ userId });

    const decryptedData = entries.map((entry) => ({
      _id: entry._id,
      app: decryptData(entry.data.app, key),
      email: decryptData(entry.data.email, key),
      username: decryptData(entry.data.username, key),
      password: decryptData(entry.data.password, key),
      authenticator: decryptData(entry.data.authenticator, key),
      lastChangeAt: entry.data.lastChangeAt,
    }));

    res.json(decryptedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ❌ Delete a vault entry
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    const entry = await Vaults.findOneAndDelete({ _id: id, userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✏️ Update a vault entry
router.put("/:id", protect, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { app, email, username, password, authenticator } =
      req.body?.data || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const entry = await Vaults.findOne({ _id: id, userId });
    if (!entry)
      return res.status(404).json({ message: "Vault entry not found" });

    const key = getEncryptionKey(user);
    const updates = {};

    if (app) updates["data.app"] = encryptData(app, key);
    if (email) updates["data.email"] = encryptData(email, key);
    if (username) updates["data.username"] = encryptData(username, key);
    if (password) {
      updates["data.password"] = encryptData(password, key);
      updates["data.lastChangeAt"] = new Date();
    }
    if (authenticator !== undefined) {
      updates["data.authenticator"] = encryptData(authenticator, key);
    }

    await Vaults.updateOne({ _id: id, userId }, { $set: updates });
    const updated = await Vaults.findById(id);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
