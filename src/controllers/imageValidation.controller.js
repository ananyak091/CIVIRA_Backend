import fs from "fs";
import os from "os";
import path from "path";
import { exec } from "child_process";
import uploadToR2 from "../utils/uploadToR2.js";

export const imageValidationByML = async (req, res) => {
  try {
    console.log("========== ML CONTROLLER START ==========");
    console.log("Controller reached");

    if (!req.files || req.files.length === 0) {
      console.log("❌ No files received");
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    console.log("Files received:", req.files);

    const file = req.files[0];

    console.log("Original Name:", file.originalname);
    console.log("Mime Type:", file.mimetype);
    console.log("File Size:", file.size);

    // Create temp image
    const tempPath = path.join(
      os.tmpdir(),
      `${Date.now()}-${file.originalname}`,
    );

    fs.writeFileSync(tempPath, file.buffer);

    console.log("Temp Image Path:", tempPath);

    const pythonCommand = os.platform() === "win32" ? "py" : "python3";

    console.log("OS Platform:", os.platform());
    console.log("Python Command:", pythonCommand);

    const command = `${pythonCommand} -3.11 src/ml/predict.py "${tempPath}"`;

    console.log("Executing Command:");
    console.log(command);

    exec(command, async (error, stdout, stderr) => {
      console.log("========== PYTHON CALLBACK ==========");

      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        console.log("Temporary image deleted.");
      }

      console.log("STDOUT:");
      console.log(stdout);

      console.log("STDERR:");
      console.log(stderr);

      if (error) {
        console.log("EXEC ERROR:");
        console.log(error);

        return res.status(500).json({
          success: false,
          message: "ML Prediction Failed",
          error: error.message,
          stderr,
        });
      }

      const prediction = stdout.trim().split("\n").pop().trim();

      console.log("Prediction:", prediction);

      const valid =
        prediction === "Garbage" ||
        prediction === "Pothole" ||
        prediction === "street light" ||
        prediction === "Transformer" ||
        prediction === "water_logging";

      console.log("Is Valid:", valid);

      if (!valid) {
        console.log("Invalid Image");

        return res.json({
          success: true,
          prediction,
          isValid: false,
          message: "Please upload a Garbage or Pothole or other related image.",
        });
      }

      console.log("Uploading image to Cloudflare R2...");

      const imageURL = await uploadToR2(file);

      console.log("Uploaded Successfully");
      console.log("Image URL:", imageURL);

      console.log("========== ML CONTROLLER END ==========");

      return res.json({
        success: true,
        prediction,
        imageURL,
        isValid: true,
      });
    });
  } catch (err) {
    console.log("========== SERVER ERROR ==========");
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
