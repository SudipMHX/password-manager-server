import mongoose from "mongoose";

const encryptedFieldSchema = new mongoose.Schema(
  {
    data: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    name: encryptedFieldSchema,
    verified: {
      type: Boolean,
      default: false,
    },
    email: encryptedFieldSchema,
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordChangedAt: { type: Date },
    encryption_salt: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
