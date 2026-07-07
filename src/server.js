import express from "express";
import cors from "cors";
import connectDB from "./config/db.config.js";
import dotenv from "dotenv";
import uploadRoutes from "#src/routes/others/upload.route.js";
import authRoutes from "./routes/users/auth.routes.js";
import userRoutes from "./routes/users/user.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import authAdminRoutes from "./routes/admin/admin.auth.routes.js";
import officerAuthRoutes from "./routes/officer/officer.auth.routes.js";
import imageValidateRoutes from "./routes/others/imageValidate.routes.js";

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

// Public
app.use("/api/auth", authRoutes); // Citizen Auth
app.use("/api/user", userRoutes);

// Admin
app.use("/api/admin/auth", authAdminRoutes); // Admin Login + OTP
app.use("/api/admin", adminRoutes); // Protected Admin APIs

// Officer
app.use("/api/officer/auth", officerAuthRoutes);
// app.use("/api/officer", officerRoutes);

// Others
app.use("/api", uploadRoutes);
app.use("/api/images/validate", imageValidateRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
