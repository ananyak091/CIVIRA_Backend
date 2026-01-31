import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log("reqheaders", req.headers);
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token is",token);

  try {
    console.log("inside try")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("this is decoded", decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
