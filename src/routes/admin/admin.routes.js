import express from "express";
import adminAuthMiddleware from "#src/middlewares/adminAuthMiddleware.js";

import {
  getDashboard,
  createOfficer,
  getAllOfficers,
  updateOfficer,
  deleteOfficer,
  checkWardAvailability,
} from "#src/controllers/admin/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", adminAuthMiddleware, getDashboard);

adminRouter.post("/create-officer", adminAuthMiddleware, createOfficer);
adminRouter.get("/check-ward", adminAuthMiddleware, checkWardAvailability);

adminRouter.get("/officers", adminAuthMiddleware, getAllOfficers);
adminRouter.delete("/officers/:id", adminAuthMiddleware, deleteOfficer);

adminRouter.put("/officers/:id", adminAuthMiddleware, updateOfficer);

export default adminRouter;
