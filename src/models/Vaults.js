import mongoose from "mongoose";

const encryptedFieldSchema = new mongoose.Schema(
  {
    data: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { _id: false }
);

const vaultsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      app: encryptedFieldSchema,
      email: encryptedFieldSchema,
      username: encryptedFieldSchema,
      password: encryptedFieldSchema,
      authenticator: encryptedFieldSchema,
      lastChangeAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vault", vaultsSchema);
