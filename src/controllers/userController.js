import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  findUsersBySimilarName,
  getFriendsList,
  getFriendRequestsList,
  getFriendRequestsSentList,
} from "../services/userService.js";
import { createNotification } from "../services/notificationService.js";
import redisClient from "../config/redisClient.js";

export const createUserHandler = async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserHandler = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsersHandler = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserHandler = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map((file) => file.path);
      updateData["profile.avatar"] = imagePaths.join(",");
    }
    const updatedUser = await updateUser(req.params.id, updateData);

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res
      .status(201)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserHandler = async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUserHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await loginUser(username, password);
    await redisClient.hSet("token_users", user._id.toString(), token);
    return res.status(200).json({
      id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendFriendRequestHandler = async (req, res, io) => {
  const { userId, targetId } = req.body;

  try {
    const friend = await sendFriendRequest(userId, targetId);
    const user = await getUserById(userId);
    const data = {
      userId: targetId,
      type: "friend",
      message: "Bạn nhận được lời mời kết bạn từ " + user.profile.name,
      source: targetId,
    };
    const notification = await createNotification(data);
    const authorSocket = await redisClient.hGet(
      "online_users",
      post.authorId._id.toString()
    );
    console.log("authorSocket", authorSocket);
    io.to(authorSocket).emit("sendFriendRequest", user);
    io.to(authorSocket).emit("newNotification", notification);
    return res.status(200).json({ friend });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const cancelFriendRequestHandler = async (req, res, io) => {
  const { userId, targetId } = req.params;

  try {
    const friend = await cancelFriendRequest(userId, targetId);
    const user = await getUserById(userId);
    const data = {
      userId: targetId,
      type: "friend",
      message: "Lời mời kết bạn đã được thu hồi bởi " + user.profile.name,
      source: targetId,
    };
    const notification = await createNotification(data);
    const authorSocket = await redisClient.hGet(
      "online_users",
      post.authorId._id.toString()
    );
    console.log("authorSocket", authorSocket);
    io.to(authorSocket).emit("cancelFriendRequest", user);
    io.to(authorSocket).emit("newNotification", notification);
    return res.status(200).json({ friend });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const acceptFriendRequestHandler = async (req, res, io) => {
  const { userId, requesterId } = req.body;

  try {
    const friend = await acceptFriendRequest(userId, requesterId);
    const user = await getUserById(userId);
    const data = {
      userId: requesterId,
      type: "friend",
      message: "Lời mời kết bạn đã được chấp nhận " + user.profile.name,
      source: requesterId,
    };
    const notification = await createNotification(data);
    const requesterSocket = await redisClient.hGet(
      "online_users",
      post.authorId._id.toString()
    );
    console.log("requesterSocket", requesterSocket);
    io.to(requesterSocket).emit("acceptFriendRequest", user);
    io.to(requesterSocket).emit("newNotification", notification);
    return res.status(200).json({ friend });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const declineFriendRequestHandler = async (req, res, io) => {
  const { userId, requesterId } = req.params;
  try {
    const friend = await declineFriendRequest(userId, requesterId);
    const user = await getUserById(userId);
    const data = {
      userId: requesterId,
      type: "friend",
      message: "Lời mời kết bạn bị từ chối " + user.profile.name,
      source: requesterId,
    };
    const notification = await createNotification(data);
    const requesterSocket = await redisClient.hGet(
      "online_users",
      post.authorId._id.toString()
    );
    console.log("requesterSocket", requesterSocket);
    io.to(requesterSocket).emit("declineFriendRequest", user);
    io.to(requesterSocket).emit("newNotification", notification);
    return res.status(200).json({ friend });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const findUsersBySimilarNameHandler = async (req, res) => {
  const { name } = req.params;
  try {
    const users = await findUsersBySimilarName(name);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const logoutHandler = async (req, res, io) => {
  try {
    const { userId } = req.body;

    await redisClient.hDel("online_users", userId);
    await redisClient.hDel("token_users", userId);
    io.emit("online_status_update", await redisClient.hGetAll("online_users"));

    res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng xuất", error: error.message });
  }
};

export const getFriendsListHandler = async (req, res) => {
  try {
    const friends = await getFriendsList(req.params.userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving friends list", error });
  }
};

export const getFriendRequestsListHandler = async (req, res) => {
  try {
    const friends = await getFriendRequestsList(req.params.userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving friends list", error });
  }
};

export const getFriendRequestsSentListHandler = async (req, res) => {
  try {
    const friends = await getFriendRequestsSentList(req.params.userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving friends list", error });
  }
};
