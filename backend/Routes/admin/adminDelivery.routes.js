import { Router } from "express";
import { auth, isAdmin } from "../../Middlewares/auth.js";
import {
  getAllWarehouseLocations,
  addNewWarehouseLocation,
  updateWarehouseAddress,
  deleteWarehouseAddress,
  setDefaultWarehouseAddress,
  unsetDefaultWarehouseAddress,
} from "../../Controllers/admin/adminDelivery.controller.js";

const router = Router();

// Get all warehouse locations (sorted by default first)
router.get("/warehouse", auth, isAdmin, getAllWarehouseLocations);

// Add new warehouse location
router.post("/warehouse", auth, isAdmin, addNewWarehouseLocation);

// Update warehouse location
router.put("/warehouse/:id", auth, isAdmin, updateWarehouseAddress);
router.patch("/warehouse/:id", auth, isAdmin, updateWarehouseAddress);

// Delete warehouse location
router.delete("/warehouse/:id", auth, isAdmin, deleteWarehouseAddress);

// Set default warehouse location
router.patch(
  "/warehouse/:id/default",
  auth,
  isAdmin,
  setDefaultWarehouseAddress
);

// Unset default warehouse location
router.patch(
  "/warehouse/:id/unset-default",
  auth,
  isAdmin,
  unsetDefaultWarehouseAddress
);

export default router;
