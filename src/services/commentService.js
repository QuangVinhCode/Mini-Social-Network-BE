import Comment from "../models/comment.js";

// Tạo bình luận mới
export const createComment = async ({ postId, userId, content }) => {
  const comment = new Comment({ postId, userId, content });
  return await comment.save();
};

export const replyToComment = async ({
  postId,
  userId,
  content,
  parentCommentId,
}) => {
  const reply = new Comment({
    postId,
    userId,
    content,
    parentComment: parentCommentId,
  });
  return await reply.save();
};

export const getComments = async () => {
  return await Comment.find({});
};

// Lấy bình luận theo ID
export const getCommentById = async (commentId) => {
  return await Comment.findById(commentId)
    .populate("userId", "username")
    .populate("likes", "username");
};

// Lấy tất cả bình luận của một bài viết
export const getCommentsByPostId = async (postId) => {
  return await Comment.find({ postId })
    .sort({ createdAt: -1 }) // Sắp xếp theo thời gian (cũ trước, mới sau)
    .populate("userId", "username profile.name profile.avatar")
    .populate("likes", "username");
};

// Cập nhật bình luận
export const updateComment = async (commentId, updateData) => {
  return await Comment.findByIdAndUpdate(commentId, updateData, { new: true });
};

// Xóa bình luận
export const deleteComment = async (commentId) => {
  return await Comment.findByIdAndDelete(commentId);
};

// Thêm hoặc xóa like
export const toggleLike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  const isLiked = comment.likes.includes(userId);
  if (isLiked) {
    // Bỏ like
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
  } else {
    // Thêm like
    comment.likes.push(userId);
  }
  return await comment.save();
};
