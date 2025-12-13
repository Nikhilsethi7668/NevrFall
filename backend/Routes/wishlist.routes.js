import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, hydrateGuestWishlist } from "../Controllers/wishlist.controller.js";
import { auth } from "../Middlewares/auth.js";

const router = express.Router();

// Public routes (must be before auth)
router.post("/hydrate", hydrateGuestWishlist);

router.use(auth);

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);

export default router;
