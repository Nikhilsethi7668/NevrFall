import { Router } from "express";
import {
  createReview,
  updateReview,
  addReviewImages,
  deleteReviewImage,
  deleteReview,
  getMyReviewForProduct,
  getProductReviews,
} from "../controllers/reviewController.js";
import { auth } from "../Middlewares/auth.js";

const router = Router();

router.get("/reviews", getProductReviews);

router.get("/reviews/my", auth, getMyReviewForProduct);
router.post("/reviews", auth, createReview);
router.put("/reviews/:id", auth, updateReview);
router.patch("/reviews/:id/images/add", auth, addReviewImages);
router.delete("/reviews/:id/images", auth, deleteReviewImage);
router.delete("/reviews/:id", auth, deleteReview);

export default router;
