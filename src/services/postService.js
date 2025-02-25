import Post from "../models/post.js";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

const __dirname = path.resolve();

// Lấy ảnh bài viết
export const getImageByName = async (imageName) => {
  const imagePath = path.join(__dirname, "src/img", imageName);

  if (!fs.existsSync(imagePath)) {
    throw new Error("Image not found");
  }

  return imagePath;
};

// Tạo bài viết mới
export const createPost = async (postData) => {
  const post = new Post(postData);
  return await post.save();
};

// Lấy bài viết theo ID
export const getPostById = async (postId) => {
  return await Post.findById(postId)
    .populate("authorId", "username profile.avatar profile.name")
    .populate("likes", "username");
};

// Lấy tất cả bài viết
export const getAllPosts = async () => {
  return await Post.find()
    .sort({ createdAt: -1 }) // Sắp xếp bài viết mới nhất trước
    .populate("authorId", "username profile.name profile.avatar")
    .populate("likes", "username");
};

// Cập nhật bài viết
export const updatePost = async (postId, updateData) => {
  return await Post.findByIdAndUpdate(postId, updateData, { new: true });
};

// Xóa bài viết
export const deletePost = async (postId) => {
  return await Post.findByIdAndDelete(postId);
};

// Thêm hoặc xóa like
export const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    // Bỏ like
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    // Thêm like
    post.likes.push(userId);
  }
  return await post.save();
};

export const checkLike = async (postId, userId) => {
  const flag = await Post.findOne({
    _id: postId,
    likes: new mongoose.Types.ObjectId(userId),
  });
  return !!flag;
};
