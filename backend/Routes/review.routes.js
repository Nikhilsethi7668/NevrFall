// routes/review.routes.js
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


const router = Router();

router.get("/reviews", getProductReviews);

router.get("/reviews/my", getMyReviewForProduct);
router.post("/reviews", createReview);
router.put("/reviews/:id", updateReview);
router.patch("/reviews/:id/images/add", addReviewImages);
router.delete("/reviews/:id/images", deleteReviewImage);
router.delete("/reviews/:id", deleteReview);

export default router;
