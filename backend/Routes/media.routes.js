import { Router } from "express";
import { deleteObject } from "../Controllers/media.controller.js";

const router = Router();



router.delete("/media/object", deleteObject);

export default router;
