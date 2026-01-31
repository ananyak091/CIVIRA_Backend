import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2 from "../config/r2.config.js";

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post("/upload", upload.single("image"), async (req, res) => {
  const url = await uploadToR2(req.file);
  res.json({ url });
});

export default uploadRouter;
