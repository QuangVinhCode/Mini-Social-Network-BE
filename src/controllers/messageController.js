import redisClient from "../config/redisClient.js";
import {
  sendMessage,
  getConversation,
  getUnreadMessages,
  markMessageAsRead,
  deleteMessage,
  getChatList,
  getLastMessages,
} from "../services/messageService.js";
import { createNotification } from "../services/notificationService.js";
import { getUserById } from "../services/userService.js";

export const sendMessageHandler = async (req, res, io) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await sendMessage({ senderId, receiverId, content });
    const user = await getUserById(senderId);

    const data = {
      userId: receiverId,
      type: "message",
      message: "Đã nhận được tin nhắn từ " + user.profile.name,
      source: user._id,
    };
    const notification = await createNotification(data);

    // 🔥 Lấy socket từ Redis thay vì từ socketMap
    const receiverSocket = await redisClient.hGet("online_users", receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", message);
      io.to(receiverSocket).emit("newNotification", notification);
    }

    res
      .status(201)
      .json({ message: "Tin nhắn được gửi thành công.", data: message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getConversationHandler = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const { currentUserId } = req.query; // ID của tài khoản hiện tại
    const messages = await getConversation(userId1, userId2);

    const enrichedMessages = messages.map((msg) => ({
      ...msg,
      isCurrentUser: msg.senderId.toString() === currentUserId, // Gắn flag xác định tin nhắn thuộc tài khoản hiện tại
    }));

    res.json(enrichedMessages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLastMessagesHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await getLastMessages(userId);
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadMessagesHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await getUnreadMessages(userId);
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markMessageAsReadHandler = async (req, res, io) => {
  try {
    const { id } = req.body;
    console.log("markMessage ", id);
    const updatedMessage = await markMessageAsRead(id);

    if (!updatedMessage)
      return res.status(404).json({ message: "Tin nhắn không tồn tại." });
    console.log("markMessage ", updatedMessage.senderId.toString());
    const senderSocket = await redisClient.hGet(
      "online_users",
      updatedMessage.senderId.toString()
    );
    console.log("senderSocket",senderSocket);
    if (senderSocket) {
      io.to(senderSocket).emit("messageRead", id);
    } else {
      console.log(`Socket ${senderSocket} không hợp lệ, xóa khỏi Redis.`);
      await redisClient.hDel("online_users", updatedMessage.senderId); // Xóa socket rác
    }
    res.status(201).json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMessageHandler = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await deleteMessage(messageId);
    if (!deletedMessage)
      return res.status(404).json({ message: "Tin nhắn không tồn tại." });
    res.json({
      message: "Tin nhắn đã được xóa thành công.",
      data: deletedMessage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getChatListHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatList = await getChatList(userId);
    res.json(chatList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
