import jwt from "jsonwebtoken";

const officerAuthMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    console.log("inside officer verify");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check role
    if (decoded.role !== "officer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Officer access only.",
      });
    }

    // Attach officer info
    req.officer = decoded;
    req.officerId = decoded.id;

    next();
  } catch (error) {
    console.error("Officer Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token.",
    });
  }
};

export default officerAuthMiddleware;
