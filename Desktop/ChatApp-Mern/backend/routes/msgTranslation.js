import express from 'express';
import { handleTranslateMsgs } from '../controllers/translationController.js';

const router = express.Router();

router.post("/", handleTranslateMsgs);

export default router;