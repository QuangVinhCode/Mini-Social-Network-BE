import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Mã hóa mật khẩu
const hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const salt = await bcrypt.genSalt(10);
      let hashPassWord = await bcrypt.hash(password, salt);
      resolve(hashPassWord);
    } catch (e) {
      reject(e);
    }
  });
};
//Tạo tài khoản
export const createUser = async (userData) => {
  userData.password = await hashUserPassword(userData.password);
  const user = new User(userData);
  return await user.save();
};
//Lấy thông tin tài khoản
export const getUserById = async (id) => {
  return await User.findById(id)
    .populate("friends", "_id profile.name profile.avatar")
    .populate("friendRequests", "_id profile.name profile.avatar")
    .populate("friendRequestsSent", "_id profile.name profile.avatar");
};
//Lấy danh sách user
export const getAllUsers = async () => {
  return await User.find({});
};
//Cập nhật user
export const updateUser = async (id, updatedData) => {
  return await User.findByIdAndUpdate(id, updatedData, { new: true });
};
//Xóa tài khoản
export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Username hoặc mật khẩu không chính xác.");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Username hoặc mật khẩu không chính xác.");
  }
  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
  return { user, token };
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (userId, targetId) => {
  const user = await User.findById(userId);
  const targetUser = await User.findById(targetId);

  if (!targetUser || !user) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (targetUser.friendRequests.includes(userId)) {
    throw new Error("Bạn đã gửi lời mời trước đó.");
  }

  if (targetUser.friends.includes(userId)) {
    throw new Error("Người này đã là bạn của bạn.");
  }

  targetUser.friendRequests.push(userId);
  user.friendRequestsSent.push(targetId);
  await Promise.all([user.save(), targetUser.save()]);
  return targetUser;
};

// Hủy lời mời kết bạn
export const cancelFriendRequest = async (userId, targetId) => {
  const user = await User.findById(userId);
  const targetUser = await User.findById(targetId);
  if (!user || !targetUser) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (!targetUser.friendRequestsSent.includes(userId)) {
    throw new Error("Bạn chưa gửi lời mời.");
  }

  if (user.friends.includes(targetId)) {
    throw new Error("Người này đã là bạn của bạn.");
  }
  user.friendRequestsSent = user.friendRequestsSent.filter(
    (id) => id.toString() !== targetId
  );
  targetUser.friendRequests = targetUser.friendRequests.filter(
    (id) => id.toString() !== userId
  );
  await Promise.all([user.save(), targetUser.save()]);
  return targetUser;
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!user || !requester) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (!user.friendRequests.includes(requesterId)) {
    throw new Error("Không có lời mời kết bạn từ người dùng này.");
  }

  // Thêm vào danh sách bạn bè
  user.friends.push(requesterId);
  requester.friends.push(userId);

  // Xóa lời mời kết bạn
  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== requesterId
  );
  requester.friendRequestsSent = requester.friendRequestsSent.filter(
    (id) => id.toString() !== requesterId
  );
  await Promise.all([user.save(), requester.save()]);
  return requester;
};

// Từ chối lời mời kết bạn
export const declineFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) {
    throw new Error("Người dùng không tồn tại.");
  }

  if (!user.friendRequests.includes(requesterId)) {
    throw new Error("Không có lời mời kết bạn từ người dùng này.");
  }

  // Xóa lời mời kết bạn
  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== requesterId
  );
  requester.friendRequestsSent = requester.friendRequestsSent.filter(
    (id) => id.toString() !== userId
  );
  await Promise.all([user.save(), requester.save()]);
  return requester;
};

export const findUsersBySimilarName = async (partialName) => {
  return await User.find(
    {
      "profile.name": { $regex: partialName, $options: "i" }, // Tìm gần đúng, không phân biệt chữ hoa/chữ thường
    },
    { "profile.name": 1, "profile.avatar": 1, _id: 1 }
  );
};

export const getFriendsList = async (userId) => {
  try {
    const user = await User.findById(userId).populate(
      "friends",
      "username email profile"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.friends;
  } catch (error) {
    console.error("Error getting friends list:", error);

    res.status(500).json({
      message: "Error retrieving friends list",
      error: error.message || "Unknown error", // Lấy chi tiết lỗi
    });
  }
};

export const getFriendRequestsList = async (userId) => {
  try {
    const user = await User.findById(userId).populate(
      "friendRequests",
      "username email profile"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.friendRequests;
  } catch (error) {
    console.error("Error getting friends list:", error);

    res.status(500).json({
      message: "Error retrieving friends list",
      error: error.message || "Unknown error", // Lấy chi tiết lỗi
    });
  }
};

export const getFriendRequestsSentList = async (userId) => {
  try {
    const user = await User.findById(userId).populate(
      "friendRequestsSent",
      "username email profile"
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user.friendRequestsSent;
  } catch (error) {
    console.error("Error getting friends list:", error);

    res.status(500).json({
      message: "Error retrieving friends list",
      error: error.message || "Unknown error", // Lấy chi tiết lỗi
    });
  }
};
