import express from "express";
import { handleGetAllMessages } from "../controllers/messageControllers.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/",verifyUser, handleGetAllMessages);


export default router;