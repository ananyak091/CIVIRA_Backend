import axios from "axios";

const USE_ML = false; // 🔥 change to true when ML is ready

export const imageValidationByML = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    // ✅ DEV MODE (ML OFF)
    if (!USE_ML) {
      const results = req.files.map((file) => ({
        fileName: file.originalname,
        isValid: true,
        label: "mock-valid",
        confidence: 1.0,
      }));

      return res.json({
        success: true,
        allValid: true,
        results,
        message: "ML bypassed (dev mode)",
      });
    }

    // ✅ ML MODE (REAL)
    const results = [];

    for (const file of req.files) {
      const mlRes = await axios.post(
        "http://localhost:8000/predict",
        file.buffer,
        {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        },
      );

      results.push({
        fileName: file.originalname,
        isValid: mlRes.data.isValid,
        label: mlRes.data.label,
        confidence: mlRes.data.confidence,
      });
    }

    const allValid = results.every((r) => r.isValid);

    return res.json({
      success: true,
      allValid,
      results,
    });
  } catch (error) {
    console.error("image validation error:", error);
    res.status(500).json({
      success: false,
      message: "ML validation failed",
    });
  }
};
