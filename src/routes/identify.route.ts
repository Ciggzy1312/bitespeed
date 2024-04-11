import express from "express";
import { identifyController } from "../controller/identify.controller";

const identifyRouter = express.Router();

identifyRouter.post("/api/identify", identifyController);

export default identifyRouter;