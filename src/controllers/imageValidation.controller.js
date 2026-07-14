// import axios from "axios";

// const USE_ML = false; // 🔥 change to true when ML is ready

// export const imageValidationByML = async (req, res, next) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No images uploaded",
//       });
//     }

//     // ✅ DEV MODE (ML OFF)
//     if (!USE_ML) {
//       const results = req.files.map((file) => ({
//         fileName: file.originalname,
//         isValid: true,
//         label: "mock-valid",
//         confidence: 1.0,
//       }));

//       // ⏳ Add 2-second delay
//       return setTimeout(() => {
//         res.json({
//           success: true,
//           allValid: true,
//           results,
//           message: "ML bypassed (dev mode)",
//         });
//       }, 4000); // 2000 ms = 2 seconds
//     }

//     // ✅ ML MODE (REAL)
//     const results = [];

//     for (const file of req.files) {
//       const mlRes = await axios.post(
//         "http://localhost:8000/predict",
//         file.buffer,
//         {
//           headers: {
//             "Content-Type": "application/octet-stream",
//           },
//         },
//       );

//       results.push({
//         fileName: file.originalname,
//         isValid: mlRes.data.isValid,
//         label: mlRes.data.label,
//         confidence: mlRes.data.confidence,
//       });
//     }

//     const allValid = results.every((r) => r.isValid);

//     return res.json({
//       success: true,
//       allValid,
//       results,
//     });
//   } catch (error) {
//     console.error("image validation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "ML validation failed",
//     });
//   }
// };

import fs from "fs";
import os from "os";
import path from "path";
import { exec } from "child_process";
import uploadToR2 from "../utils/uploadToR2.js";

export const imageValidationByML = async (req, res) => {
  try {
    console.log("Controller reached");
    console.log(req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const file = req.files[0];

    // Create temporary file
    const tempPath = path.join(
      os.tmpdir(),
      `${Date.now()}-${file.originalname}`
    );

    fs.writeFileSync(tempPath, file.buffer);

    console.log("Temp image:", tempPath);

    exec(
      `py -3.11 src/ml/predict.py "${tempPath}"`,
      async (error, stdout, stderr) => {
        // Delete temp image
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        if (error) {
          console.log(error);
          console.log(stderr);

          return res.status(500).json({
            success: false,
            message: "ML Prediction Failed",
          });
        }

        const prediction = stdout
  .trim()
  .split("\n")
  .pop()
  .trim();

        console.log("Prediction:", prediction);

        const valid =
          prediction === "Garbage" ||
          prediction === "Pothole" ||
          prediction === "street light" ||
          prediction === "Transformer" ||
          prediction === "water_logging"
          ;

        if (!valid) {
          return res.json({
            success: true,
            prediction,
            isValid: false,
            message: "Please upload a Garbage or Pothole or other related image.",
          });
        }

        // Upload valid image to Cloudflare R2
        const imageURL = await uploadToR2(file);

        return res.json({
          success: true,
          prediction,
          imageURL,
          isValid: true,
        });
      }
    );
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
