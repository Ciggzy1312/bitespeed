import express from "express";
import identifyRouter from "./identify.route";

const router = express.Router();

router.use(identifyRouter);

export default router;