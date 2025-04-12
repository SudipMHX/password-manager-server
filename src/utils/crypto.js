import crypto from "crypto";

export const generateSalt = () => {
  return crypto.randomBytes(32).toString("hex");
};
export const generateIV = () => crypto.randomBytes(12);

// Derive 256-bit key as Buffer (required for AES-256)
export const deriveKey = (hash) => {
  return crypto.createHash("sha256").update(hash.toLowerCase()).digest("hex");
};

export const encryptData = (text, key) => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    data: encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
};

export const decryptData = (encryptedObj, key) => {
  const { data, iv, tag } = encryptedObj;
  // Check if key is already a Buffer, if not convert it
  const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};