import express from "express";
import {
  createCommentHandler,
  getCommentByIdHandler,
  getCommentsByPostIdHandler,
  updateCommentHandler,
  deleteCommentHandler,
  toggleLikeHandler,
  replyToCommentHandler,
} from "../controllers/commentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const commentRouter = express.Router();

// Tạo bình luận mới
commentRouter.post("/",authenticateToken, createCommentHandler);

commentRouter.post("/reply",authenticateToken, replyToCommentHandler);

// Lấy bình luận theo ID
commentRouter.get("/:id", getCommentByIdHandler);

// Lấy tất cả bình luận của một bài viết
commentRouter.get("/post/:postId", getCommentsByPostIdHandler);

// Cập nhật bình luận
commentRouter.put("/:id", updateCommentHandler);

// Xóa bình luận
commentRouter.delete("/:id", deleteCommentHandler);

// Thêm hoặc xóa like
commentRouter.post("/:id/like", toggleLikeHandler);

export default commentRouter;
