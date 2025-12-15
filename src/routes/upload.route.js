import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2 from "../config/r2.config.js";

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post("/upload", upload.single("image"), async (req, res) => {
  const fileKey = `images/${Date.now()}-${req.file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: fileKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  });

  await r2.send(command);

  const publicUrl = `https://pub-${process.env.R2_PUBLIC_ID}.r2.dev/${fileKey}`;

  res.json({ url: publicUrl });
});

export default uploadRouter;
