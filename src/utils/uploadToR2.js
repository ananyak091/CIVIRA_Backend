import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2 from "../config/r2.config.js";

const uploadToR2 = async (file, folder = "images") => {
  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  return `https://pub-${process.env.R2_PUBLIC_ID}.r2.dev/${fileKey}`;
};

export default uploadToR2;

// function
