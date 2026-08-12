import User from "../Models/User.js"; //checked
import { redis } from "../lib/redis.js"; //checked
import { generateOtp, hashOtp } from "../utils/otp.js"; //checked
import { generateToken } from "../Middlewares/auth.js"; //checked 
import { sendEmail } from "../Services/email.service.js"; //checked 
import { sendSms } from "../Services/phone.service.js"; //checked-->TBUL
import { mergeGuestCart } from "./cart.controller.js";
import { mergeGuestWishlist } from "./wishlist.controller.js";


/**
  Requesting an OTP

  Using redis for full otp management limitimng IP , phone and blocking 
 after 5 failed attempts for 10 mins using redis key --> ipKey = otp:rl:ip:${req.ip} 
 , phKey = otp:rl:phone:${phone} , blockedKey = otp:block:${phone} , dataKey = otp:data:${phone} , 
 attemptsKey = otp:attempts:${phone} **/

export async function requestOtp(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone required" });
    const ipKey = `otp:rl:ip:${req.ip}`;
    const ipCount = await redis.incr(ipKey);
    if (ipCount === 1) await redis.expire(ipKey, 60);
    if (ipCount > 3)
      return res
        .status(429)
        .json({ error: "Too many requests with this device , try after a minute" });

    const phKey = `otp:rl:phone:${phone}`;
    const phCount = await redis.incr(phKey);
    if (phCount === 1) await redis.expire(phKey, 600);
    if (phCount > 5) {
      //block for 15 mins
      await redis.set(`otp:block:${phone}`, "1", "EX", 600);
      await redis.del(phKey);

      return res.status(429).json({ error: "OTP limit reached for this mobile number, try after 10 minutes" });
    }

    const blockedKey = `otp:block:${phone}`;
    if (await redis.get(blockedKey))
      return res
        .status(429)
        .json({ error: "Temporarily blocked due to failed attempts , try after 10 minutes" });

    const otp = generateOtp();
    console.log("Generated OTP:", otp); // For testing purposes only
    const dataKey = `otp:data:${phone}`;
    await redis.set(dataKey, hashOtp(otp), "EX", 300);
    await sendSms(phone, otp);
    console.log("Redis data is ", await redis.keys("*"));
    return res.json({ ok: true, message: "OTP sent", otp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
}
//router.post("/otp/verify/mobile", verifyOtpByMobile);
export async function verifyOtpByMobile(req, res) {
  try {
    const { phone, otp, guestCart, guestWishlist } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ error: "Phone & OTP required" });

    const blockedKey = `otp:block:${phone}`;
    if (await redis.get(blockedKey))
      return res.status(429).json({ error: "Temporarily blocked, try after 10 minutes" });

    const dataKey = `otp:data:${phone}`;
    const storedHash = await redis.get(dataKey);
    if (!storedHash)
      return res.status(400).json({ error: "OTP expired or not requested" });

    const ok = storedHash === hashOtp(otp);
    if (!ok) {
      const attemptsKey = `otp:attempts:${phone}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) await redis.expire(attemptsKey, 300);
      if (attempts >= 5) {
        await redis.set(blockedKey, "1", "EX", 300);
        await redis.del(`otp:rl:phone:${phone}`);
        await redis.del(attemptsKey);
        return res.status(429).json({ error: "Too many failed attempts, try after 5 minutes" });
      }
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    await redis.del(dataKey);
    await redis.del(`otp:attempts:${phone}`);

    const user = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone } },
      { upsert: true, new: true }
    );

    const token = generateToken(user);

    // Merge guest cart and wishlist if provided
    let mergedCart = null;
    let mergedWishlist = null;

    if (guestCart && Array.isArray(guestCart) && guestCart.length > 0) {
      const cartResult = await mergeGuestCart(user._id, guestCart);
      if (cartResult.success) {
        mergedCart = cartResult.cart;
      }
    }

    if (guestWishlist && Array.isArray(guestWishlist) && guestWishlist.length > 0) {
      const wishlistResult = await mergeGuestWishlist(user._id, guestWishlist);
      if (wishlistResult.success) {
        mergedWishlist = wishlistResult.wishlist;
      }
    }

    const response = {
      token,
      user: { id: user._id, phone: user.phone, role: user.role, name: user.name },
    };

    // Include merged data in response if available
    if (mergedCart) response.cart = mergedCart;
    if (mergedWishlist) response.wishlist = mergedWishlist;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verify failed" });
  }
}


// router.post("/otp/request/email", requestOTPByEmail);
export async function requestOTPByEmail(req, res) {
  try {
    const { email, phone } = req.body;
    if (!email || !phone)
      return res.status(400).json({ error: "All Fields are required" });
    //send otp to email
    const ipKey = `otp:rl:ip:${req.ip}`;
    const ipCount = await redis.incr(ipKey);
    if (ipCount === 1) await redis.expire(ipKey, 60);
    if (ipCount > 3)
      return res
        .status(429)
        .json({ error: "Too many requests with this device , try after a minute" });

    const phKey = `otp:rl:email:${email}`;
    const phCount = await redis.incr(phKey);
    if (phCount === 1) await redis.expire(phKey, 600);
    if (phCount > 5) {
      //block for 10 mins
      await redis.set(`otp:block:${email}`, "1", "EX", 600);
      await redis.del(phKey);

      return res.status(429).json({ error: "OTP limit reached for provided email, try after 10 minutes" });
    }

    const blockedKey = `otp:block:${email}`;
    if (await redis.get(blockedKey))
      return res
        .status(429)
        .json({ error: "Temporarily blocked due to failed attempts , try after 10 minutes" });

    const otp = generateOtp();
    console.log("Generated Email OTP:", otp);
    const dataKey = `otp:data:${email}`;
    await redis.set(dataKey, hashOtp(otp), "EX", 300);
    await sendEmail(
      email,
      "Welcome to NevrFall , Do not share OTP with anyone",
      `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
    );
    res.status(200).json({ ok: true, message: "OTP sent to email", otp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
}


//provide information of user who is logged in
export async function me(req, res) {
  res.json({ user: req.user || null });
}

// logout user
export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ ok: true });
}





//Will be used in rare case

//router.post("/otp/verify/email", verifyOtpByEmail);
export async function verifyOtpByEmail(req, res) {
  try {
    const { email, otp, phone, guestCart, guestWishlist } = req.body;
    if (!email || !otp || !phone)
      return res.status(400).json({ error: "All Fields are required" });

    const blockedKey = `otp:block:${email}`;
    if (await redis.get(blockedKey))
      return res
        .status(429)
        .json({ error: "Temporarily blocked, try after 1 hr" });

    const dataKey = `otp:data:${email}`;
    const storedHash = await redis.get(dataKey);
    if (!storedHash)
      return res.status(400).json({ error: "OTP expired or not requested" });

    const ok = storedHash === hashOtp(otp);
    if (!ok) {
      const attemptsKey = `otp:attempts:${email}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) await redis.expire(attemptsKey, 600); // 10 minutes
      if (attempts >= 5) await redis.set(blockedKey, "1", "EX", 600);
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    await redis.del(dataKey);
    await redis.del(`otp:attempts:${email}`);

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, email });
    else if (!user.email) {
      user.email = email;
      await user.save();
    }

    const token = generateToken(user);

    // Merge guest cart and wishlist if provided
    let mergedCart = null;
    let mergedWishlist = null;

    if (guestCart && Array.isArray(guestCart) && guestCart.length > 0) {
      const cartResult = await mergeGuestCart(user._id, guestCart);
      if (cartResult.success) {
        mergedCart = cartResult.cart;
      }
    }

    if (guestWishlist && Array.isArray(guestWishlist) && guestWishlist.length > 0) {
      const wishlistResult = await mergeGuestWishlist(user._id, guestWishlist);
      if (wishlistResult.success) {
        mergedWishlist = wishlistResult.wishlist;
      }
    }

    const response = {
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };

    // Include merged data in response if available
    if (mergedCart) response.cart = mergedCart;
    if (mergedWishlist) response.wishlist = mergedWishlist;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verify failed" });
  }
}
