import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLike,
  getImageByName,
  checkLike,
} from "../services/postService.js";

export const getImageByNameHandler = async (req, res) => {
  try {
    const { imageName } = req.params;
    const imagePath = await getImageByName(imageName);

    // Trả về ảnh trực tiếp
    res.sendFile(imagePath);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPostHandler = async (req, res) => {
  try {
    const { content, authorId } = req.body;
    console.log(req.files);
    // Lấy danh sách file upload
    const imagePaths = req.files.map((file) => file.filename);

    const newPost = await createPost({ authorId, content, images: imagePaths });

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy bài viết theo ID
export const getPostByIdHandler = async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả bài viết
export const getAllPostsHandler = async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePostHandler = async (req, res) => {
  try {
    const { content } = req.body;

    // Lấy danh sách file upload
    const imagePaths = req.files.map((file) => file.path);

    const updatedPost = await updatePost(req.params.id, {
      content,
      images: imagePaths,
    });

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa bài viết
export const deletePostHandler = async (req, res) => {
  try {
    const deletedPost = await deletePost(req.params.id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm hoặc xóa like
export const toggleLikeHandler = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await toggleLike(postId, userId);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkLikeHandler = async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const flag = await checkLike(postId, userId);
    res.status(201).json(flag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
