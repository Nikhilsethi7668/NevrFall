import crypto from "crypto";

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp) {
  const secret = process.env.OTP_HASH_SECRET || "otp-secret-9090909";
  return crypto.createHmac("sha256", secret).update(String(otp)).digest("hex");
}
