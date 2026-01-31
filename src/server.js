import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.route.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import imageValidateRoutes from "./routes/imageValidate.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

connectDB();
// connectCloudinary();

// 🔥 BODY PARSER (THIS FIXES req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // or restrict to your frontend Render URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api", uploadRoutes);
app.use("/api/images/validate", imageValidateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
