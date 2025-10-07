import { Router } from "express";
import {
  getAllProducts,
  getProductsByFilter,
  getProductsBySearch,
  getFacets,
  getNewArrivals,
  getFeatured,
  getTrending,
  getProductDetails,
  getVariantByKey,
  trackClick,
} from "../controllers/productPublic.js";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/filter", getProductsByFilter);
router.get("/products/search", getProductsBySearch);
router.get("/products/facets", getFacets);
router.get("/products/new", getNewArrivals);
router.get("/products/featured", getFeatured);
router.get("/products/trending", getTrending);
router.get("/products/:idOrSlug", getProductDetails);
router.get("/variants/lookup", getVariantByKey);
router.post("/products/:id/track-click", trackClick);

export default router;
