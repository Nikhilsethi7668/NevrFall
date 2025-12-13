import express from "express";
import {
  addToCart,
  removeFromCart,
  deleteFromCart,
  getCart,
  hydrateGuestCart,
} from "../Controllers/cart.controller.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.delete("/delete", deleteFromCart);
router.post("/hydrate", hydrateGuestCart);

export default router;
