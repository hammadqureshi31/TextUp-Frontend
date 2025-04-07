import express from "express";
import { createNewGroup } from "../controllers/groupControllers.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/create",verifyUser , createNewGroup);


export default router;
