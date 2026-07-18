import express from "express";

import authMiddleware from "#src/middlewares/authMiddleware.js";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
} from "#src/controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getNotifications);

notificationRouter.patch("/:id/read", authMiddleware, markNotificationRead);
notificationRouter.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationCount,
);
export default notificationRouter;
