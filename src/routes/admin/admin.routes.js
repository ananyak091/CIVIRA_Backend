import express from "express";
import adminAuthMiddleware from "#src/middlewares/adminAuthMiddleware.js";

import {
  getDashboard,
  createOfficer,
  getAllOfficers,
  updateOfficer,
  deleteOfficer,
} from "#src/controllers/admin/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", adminAuthMiddleware, getDashboard);

adminRouter.post("/create-officer", adminAuthMiddleware, createOfficer);

adminRouter.get("/officers", adminAuthMiddleware, getAllOfficers);

adminRouter.put("/officers/:id", adminAuthMiddleware, updateOfficer);

adminRouter.delete("/officers/:id", adminAuthMiddleware, deleteOfficer);

export default adminRouter;
