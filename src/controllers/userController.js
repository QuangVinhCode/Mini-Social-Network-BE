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
} from "../services/userService.js";
import { getSocketByUserId } from "../config/socketMap.js";
import { createNotification } from "../services/notificationService.js";
import { addToken } from "../config/tokenMap.js";

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
      const imagePaths = req.files.map((file) => file.filename);
      updateData["profile.avatar"] = imagePaths.join(",");
    }
    console.log(updateData);
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
    addToken(user._id, token);
    return res.status(200).json({
      id: user._id,
      username: user.username,
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
    console.log(getSocketByUserId(targetId));
    io.to(getSocketByUserId(targetId)).emit("sendFriendRequest", user);
    io.to(getSocketByUserId(targetId)).emit("newNotification", notification);
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
    console.log(getSocketByUserId(targetId));
    io.to(getSocketByUserId(targetId)).emit("cancelFriendRequest", user);
    io.to(getSocketByUserId(targetId)).emit("newNotification", notification);
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
    console.log(getSocketByUserId(requesterId));
    io.to(getSocketByUserId(requesterId)).emit("acceptFriendRequest", user);
    io.to(getSocketByUserId(requesterId)).emit("newNotification", notification);
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
    console.log(getSocketByUserId(requesterId));
    io.to(getSocketByUserId(requesterId)).emit("declineFriendRequest", user);
    io.to(getSocketByUserId(requesterId)).emit("newNotification", notification);
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
