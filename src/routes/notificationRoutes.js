import express from "express";
import {
  createNotificationHandler,
  getNotificationsByUserIdHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
  getReadNotificationsByUserIdHandler,
  getUnreadNotificationsByUserIdHandler,
  contUnreadNotificationsByUserIdHandler,
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const notificationRouter = express.Router();

// Tạo thông báo mới
notificationRouter.post("/", authenticateToken, createNotificationHandler);

// Lấy tất cả thông báo của người dùng
notificationRouter.get(
  "/user/:userId",
  authenticateToken,
  getNotificationsByUserIdHandler
);

notificationRouter.get(
  "/read/:userId",
  authenticateToken,
  getReadNotificationsByUserIdHandler
);

notificationRouter.get(
  "/unread/:userId",
  authenticateToken,
  getUnreadNotificationsByUserIdHandler
);

notificationRouter.get(
  "/count-unread/:userId",
  authenticateToken,
  contUnreadNotificationsByUserIdHandler
);

// Đánh dấu một thông báo là đã đọc
notificationRouter.put("/:id", authenticateToken, markAsReadHandler);

// Đánh dấu tất cả thông báo là đã đọc
notificationRouter.put(
  "/user/:userId",
  authenticateToken,
  markAllAsReadHandler
);

// Xóa một thông báo
notificationRouter.delete("/:id", authenticateToken, deleteNotificationHandler);

// Xóa tất cả thông báo của người dùng
notificationRouter.delete(
  "/user/:userId",
  authenticateToken,
  deleteAllNotificationsHandler
);

export default notificationRouter;
