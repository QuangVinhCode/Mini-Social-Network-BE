import Message from "../models/message.js";
import User from "../models/user.js";
import mongoose from "mongoose";
/**
 * Gửi tin nhắn
 */
export const sendMessage = async ({ senderId, receiverId, content }) => {
  const message = new Message({ senderId, receiverId, content });
  return await message.save();
};
/**
 * Lấy tất cả tin nhắn giữa hai người dùng
 */
export const getConversation = async (userId1, userId2) => {
  return await Message.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  })
    .sort({ sentAt: 1 }) // Sắp xếp theo thứ tự thời gian tăng dần
    .lean(); // Chuyển dữ liệu sang plain JavaScript object
};

export const getLastMessages = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  try {
    // Fetch user's friend list and populate the necessary fields
    const user = await User.findById(userId).populate(
      "friends",
      "profile.name profile.avatar"
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch the last messages for all friends
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { sentAt: -1 }, // Sort by the most recent message first
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" }, // Get the first message in the group
        },
      },
      {
        $lookup: {
          from: "users", // Name of the users collection
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          _id: 0,
          withUser: {
            $arrayElemAt: ["$userInfo", 0], // Flatten the user info array
          },
          lastMessage: {
            $cond: {
              if: { $eq: [{ $type: "$lastMessage" }, "missing"] }, // Check if lastMessage exists
              then: {},
              else: "$lastMessage",
            },
          },
        },
      },
    ]);

    // Create an array of all friends
    const friends = user.friends;

    // Create a result array with friend info and last message data
    const allMessages = friends.map((friend) => {
      // Find the message for the current friend
      const message = messages.find(
        (msg) => msg.withUser._id.toString() === friend._id.toString()
      );

      // Construct the final friend object with name, avatar, and lastMessage (if any)
      return {
        withUser: {
          _id: friend._id,
          name: friend.profile.name, // Include name from profile
          avatar: friend.profile.avatar, // Include avatar from profile
        },
        lastMessage: message ? message.lastMessage : {}, // Add last message data
      };
    });

    // Optionally, sort by most recent conversations first (if required)
    const sortedMessages = allMessages.sort((a, b) => {
      // Sort by most recent message sent time
      return new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt);
    });

    return sortedMessages;
  } catch (error) {
    console.error("Error details:", error); // Log the error details
    throw new Error("Error while fetching last messages: " + error.message);
  }
};

/**
 * Lấy tất cả tin nhắn chưa đọc của một người dùng
 */
export const getUnreadMessages = async (userId) => {
  return await Message.find({
    receiverId: userId,
    isRead: false,
  });
};

/**
 * Đánh dấu tin nhắn đã đọc
 */
export const markMessageAsRead = async (messageId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { isRead: true },
    { new: true } // Cập nhật updatedAt
  );
};

/**
 * Xóa một tin nhắn
 */
export const deleteMessage = async (messageId) => {
  return await Message.findByIdAndDelete(messageId);
};

/**
 * Lấy danh sách người dùng đã nhắn tin với người dùng hiện tại
 */
export const getChatList = async (userId) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    {
      $group: {
        _id: null,
        contacts: {
          $addToSet: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
        },
      },
    },
  ]);
  return conversations[0]?.contacts || [];
};
