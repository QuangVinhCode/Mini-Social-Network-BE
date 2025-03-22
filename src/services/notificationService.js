import Notification from "../models/notification.js";

// Tạo thông báo mới
export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

// Lấy tất cả thông báo của người dùng
export const getNotificationsByUserId = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
};

export const getReadNotificationsByUserId = async (userId) => {
  return await Notification.find({ userId, isRead: true }).sort({
    createdAt: -1,
  }); // Sắp xếp mới nhất trước
};

export const getUnreadNotificationsByUserId = async (userId) => {
  return await Notification.find({ userId, isRead: false }).sort({
    createdAt: -1,
  }); // Sắp xếp mới nhất trước
};

export const countUnreadNotifications = async (userId) => {
  return await Notification.countDocuments({
    userId: userId, // Lọc theo ID người dùng
    isRead: false, // Điều kiện thông báo chưa đọc
  });
};

// Đánh dấu một thông báo là đã đọc
export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

// Đánh dấu tất cả thông báo của người dùng là đã đọc
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

// Xóa một thông báo
export const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

// Xóa tất cả thông báo của người dùng
export const deleteAllNotificationsByUserId = async (userId) => {
  return await Notification.deleteMany({ userId });
};
