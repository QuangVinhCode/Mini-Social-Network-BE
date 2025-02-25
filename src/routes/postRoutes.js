import express from "express";
import {
  createPostHandler,
  getPostByIdHandler,
  getAllPostsHandler,
  updatePostHandler,
  deletePostHandler,
  toggleLikeHandler,
  getImageByNameHandler,
  checkLikeHandler,
} from "../controllers/postController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const postRouter = express.Router();

// Tạo bài viết mới
postRouter.post(
  "/",
  authenticateToken,
  upload.array("images", 5),
  createPostHandler
);

// Lấy bài viết theo ID
postRouter.get("/:id", getPostByIdHandler);

// Lấy tất cả bài viết
postRouter.get("/", getAllPostsHandler);

// Cập nhật bài viết
postRouter.put(
  "/:id",
  authenticateToken,
  upload.array("images", 5),
  updatePostHandler
);

// Xóa bài viết
postRouter.delete("/:id", authenticateToken, deletePostHandler);

// Thêm hoặc xóa like
postRouter.patch("/like", toggleLikeHandler);

postRouter.get("/img/:imageName", getImageByNameHandler);

postRouter.get("/like/:postId/:userId", checkLikeHandler);

export default postRouter;
