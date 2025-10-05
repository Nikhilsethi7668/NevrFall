// controllers/auth.controller.js
import User from "../Models/User.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import jwt from "jsonwebtoken";

// mock SMS (replace with MSG91/Twilio)
async function sendSms(phone, otp) {
  console.log(`[SMS] to ${phone}: ${otp}`);
  return true;
}

const ACCESS_TTL = process.env.JWT_EXPIRES || "7d";

export async function requestOtp(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone required" });

    // Rate-limit by IP
    const ipKey = `otp:rl:ip:${req.ip}`;
    const ipCount = await redis.incr(ipKey);
    if (ipCount === 1) await redis.expire(ipKey, 60); // 60s window
    if (ipCount > 3)
      return res
        .status(429)
        .json({ error: "Too many requests, try after a minute" });

    // Rate-limit by phone (soft)
    const phKey = `otp:rl:phone:${phone}`;
    const phCount = await redis.incr(phKey);
    if (phCount === 1) await redis.expire(phKey, 900); // 15 min window
    if (phCount > 5)
      return res.status(429).json({ error: "OTP limit reached, try later" });

    // Block if too many wrong attempts recently
    const blockedKey = `otp:block:${phone}`;
    const blocked = await redis.get(blockedKey);
    if (blocked)
      return res
        .status(429)
        .json({ error: "Temporarily blocked due to failed attempts" });

    // Create user if not exists (idempotent)
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    // Generate OTP
    const otp = generateOtp();
    const dataKey = `otp:data:${phone}`;
    await redis.set(dataKey, hashOtp(otp), "EX", 60); // 60s TTL

    await sendSms(phone, otp);
    return res.json({ ok: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ error: "Phone & OTP required" });

    // Check block
    const blockedKey = `otp:block:${phone}`;
    const blocked = await redis.get(blockedKey);
    if (blocked)
      return res.status(429).json({ error: "Temporarily blocked, try later" });

    const dataKey = `otp:data:${phone}`;
    const storedHash = await redis.get(dataKey);
    if (!storedHash)
      return res.status(400).json({ error: "OTP expired or not requested" });

    const ok = storedHash === hashOtp(otp);
    if (!ok) {
      // track attempts
      const attemptsKey = `otp:attempts:${phone}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) await redis.expire(attemptsKey, 600); // 10 min
      if (attempts >= 5) {
        // 5 wrong attempts → 10 min block
        await redis.set(blockedKey, "1", "EX", 600);
      }
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    // success: delete otp + attempts
    await redis.del(dataKey);
    await redis.del(`otp:attempts:${phone}`);

    // ensure user exists
    const user = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone } },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TTL }
    );

    // send as cookie or JSON (choose one)
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json({
        token,
        user: { id: user._id, phone: user.phone, role: user.role },
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verify failed" });
  }
}

export async function me(req, res) {
  res.json({ user: req.user || null });
}

export async function logout(req, res) {
  res.clearCookie("accessToken");
  res.json({ ok: true });
}
