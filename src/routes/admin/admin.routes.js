import express from "express";
import adminAuthMiddleware from "#src/middlewares/adminAuthMiddleware.js";

import {
  getDashboard,
  createOfficer,
  getAllOfficers,
  updateOfficer,
  toggleOfficerStatus,
  checkWardAvailability,
} from "#src/controllers/admin/admin.controller.js";

import {
  getAdminNotifications,
  getUnreadAdminNotificationCount,
  markAdminNotificationRead,
} from "#src/controllers/admin/adminNotification.controller.js";

const adminRouter = express.Router();

/* Dashboard */
adminRouter.get("/dashboard", adminAuthMiddleware, getDashboard);
adminRouter.get(
  "/notifications/unread-count",
  adminAuthMiddleware,
  getUnreadAdminNotificationCount,
);

/* Officer */
adminRouter.post("/create-officer", adminAuthMiddleware, createOfficer);

adminRouter.get("/check-ward", adminAuthMiddleware, checkWardAvailability);

adminRouter.get("/officers", adminAuthMiddleware, getAllOfficers);

adminRouter.put("/officers/:id", adminAuthMiddleware, updateOfficer);

// Suspend / Activate Officer
adminRouter.patch(
  "/officers/:id/status",
  adminAuthMiddleware,
  toggleOfficerStatus,
);

/* Notifications */
adminRouter.get("/notifications", adminAuthMiddleware, getAdminNotifications);

adminRouter.patch(
  "/notifications/:id/read",
  adminAuthMiddleware,
  markAdminNotificationRead,
);

export default adminRouter;
