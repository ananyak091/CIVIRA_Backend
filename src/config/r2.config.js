// r2.config.js
import dotenv from "dotenv";
dotenv.config();

import { S3Client } from "@aws-sdk/client-s3";
// console.log("Access:", process.env.R2_ACCESS_KEY);
// console.log("Secret:", process.env.R2_SECRET_KEY);
// console.log("Account:", process.env.R2_ACCOUNT_ID);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

export default r2;

// connection with cloudfare
