import {
  createComment,
  getCommentById,
  getCommentsByPostId,
  updateComment,
  deleteComment,
  toggleLike,
  replyToComment,
  getComments,
} from "../services/commentService.js";
import { createNotification } from "../services/notificationService.js";
import { getPostById } from "../services/postService.js";
import { getUserById } from "../services/userService.js";
import redisClient from "../config/redisClient.js";

export const createCommentHandler = async (req, res) => {
  try {
    const { postId, userId, content } = req.body;
    const comment = await createComment({ postId, userId, content });
    const post = await getPostById(postId);
    const user = await getUserById(userId);
    if (comment) {
      const data = {
        userId: post.authorId._id,
        type: "comment",
        message:
          "Bài viết có tên " +
          post.content +
          " đã được tài khoản " +
          user.profile.name +
          " bình luận",
        source: post._id,
      };
      const notification = await createNotification(data);
      const authorSocket = await redisClient.hGet(
        "online_users",
        post.authorId._id.toString()
      );
      console.log("authorSocket", authorSocket);
      if (authorSocket) {
        io.to(authorSocket).emit("newNotification", notification);
      } else {
        console.log("Không online");
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create comment", error: error.message });
  }
};

export const replyToCommentHandler = async (req, res) => {
  try {
    const { postId, userId, content, parentCommentId } = req.body;
    const reply = await replyToComment({
      postId,
      userId,
      content,
      parentCommentId,
    });
    res.status(201).json(reply);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create reply", error: error.message });
  }
};

export const getCommentsHandler = async (req, res) => {
  try {
    const comment = await getComments();
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy bình luận theo ID
export const getCommentByIdHandler = async (req, res) => {
  try {
    const comment = await getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả bình luận của một bài viết
export const getCommentsByPostIdHandler = async (req, res) => {
  try {
    const comments = await getCommentsByPostId(req.params.postId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật bình luận
export const updateCommentHandler = async (req, res) => {
  try {
    const updatedComment = await updateComment(req.params.id, req.body);
    if (!updatedComment)
      return res.status(404).json({ message: "Comment not found" });
    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa bình luận
export const deleteCommentHandler = async (req, res) => {
  try {
    const deletedComment = await deleteComment(req.params.id);
    if (!deletedComment)
      return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm hoặc xóa like
export const toggleLikeHandler = async (req, res) => {
  try {
    const comment = await toggleLike(req.params.id, req.body.userId);
    res.json({ message: "Like toggled successfully", comment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
