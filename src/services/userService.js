import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate salt và hash mật khẩu
      const salt = await bcrypt.genSalt(10); // Sử dụng genSalt để tạo salt
      let hashPassWord = await bcrypt.hash(password, salt); // Hash password với salt
      resolve(hashPassWord);
    } catch (e) {
      reject(e);
    }
  });
};

export const createUser = async (userData) => {
  userData.password = await hashUserPassword(userData.password);
  const user = new User(userData);
  return await user.save();
};

export const getUserById = async (id) => {
  return await User.findById(id)
    .populate("friends", "_id profile.name profile.avatar")
    .populate("friendRequests", "_id profile.name profile.avatar")
    .populate("friendRequestsSent", "_id profile.name profile.avatar");
};

export const getAllUsers = async () => {
  return await User.find({});
};

export const updateUser = async (id, updatedData) => {
  return await User.findByIdAndUpdate(id, updatedData, { new: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const loginUser = async (username, password) => {
  // Tìm người dùng theo email
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Username hoặc mật khẩu không chính xác.");
  }

  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Username hoặc mật khẩu không chính xác.");
  }
  // Tạo token JWT
  const token = jwt.sign(
    { userId: user._id, username: user.username }, // Payload
    process.env.JWT_SECRET, // Secret key từ .env
    { expiresIn: process.env.JWT_EXPIRES } // Token hết hạn sau JWT_EXPIRES
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
