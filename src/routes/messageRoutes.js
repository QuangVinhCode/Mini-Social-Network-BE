import express from "express";
import {
  sendMessageHandler,
  getConversationHandler,
  getUnreadMessagesHandler,
  markMessageAsReadHandler,
  deleteMessageHandler,
  getChatListHandler,
  getLastMessagesHandler,
} from "../controllers/messageController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const messageRouter = express.Router();

// API gửi tin nhắn
messageRouter.post("/", authenticateToken, (req, res) =>
  sendMessageHandler(req, res, req.app.get("io"))
);

// API lấy danh sách tin nhắn giữa 2 người dùng
messageRouter.get(
  "/conversation/:userId1/:userId2",
  authenticateToken,
  getConversationHandler
);

messageRouter.get("/last-message/:userId", getLastMessagesHandler);

// API lấy danh sách tin nhắn chưa đọc
messageRouter.get(
  "/unread/:userId",
  authenticateToken,
  getUnreadMessagesHandler
);

// API đánh dấu tin nhắn đã đọc
messageRouter.patch(
  "/mark-read",
  authenticateToken,
  (req, res) => markMessageAsReadHandler(req, res, req.app.get("io"))
);

// API xóa tin nhắn
messageRouter.delete("/:messageId", authenticateToken, deleteMessageHandler);

// API lấy danh sách người dùng đã nhắn tin
messageRouter.get(
  "/conversations/:userId",
  authenticateToken,
  getChatListHandler
);

export default messageRouter;
