import express from "express";
import { Router } from "express";
import { imageValidationByML } from "#src/controllers/imageValidation.controller.js";
import authMiddleware from "#src/middlewares/authMiddleware.js";
import upload from "#src/middlewares/upload.js";

const imageValidationRouter = express.Router();

imageValidationRouter.post(
  "/ml/model/validation",
  authMiddleware,
  upload.array("images", 3),
  imageValidationByML,
);

export default imageValidationRouter;
