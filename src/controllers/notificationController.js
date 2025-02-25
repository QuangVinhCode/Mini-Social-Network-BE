import {
    createNotification,
    getNotificationsByUserId,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotificationsByUserId,
    getReadNotificationsByUserId,
    getUnreadNotificationsByUserId,
    countUnreadNotifications
  } from "../services/notificationService.js";
  
  // Tạo thông báo mới
  export const createNotificationHandler = async (req, res) => {
    try {
      const notification = await createNotification(req.body);
      res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Lấy tất cả thông báo của người dùng
  export const getNotificationsByUserIdHandler = async (req, res) => {
    try {
      const notifications = await getNotificationsByUserId(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  // Lấy tất cả thông báo đã đọc của người dùng
  export const getReadNotificationsByUserIdHandler = async (req, res) => {
    try {
      const notifications = await getReadNotificationsByUserId(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };


  // Lấy tất cả thông báo chưa đọc của người dùng
  export const getUnreadNotificationsByUserIdHandler = async (req, res) => {
    try {
      const notifications = await getUnreadNotificationsByUserId(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  export const contUnreadNotificationsByUserIdHandler = async (req, res) => {
    try {
      const notifications = await countUnreadNotifications(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Đánh dấu một thông báo là đã đọc
  export const markAsReadHandler = async (req, res) => {
    try {
      const updatedNotification = await markAsRead(req.params.id);
      if (!updatedNotification)
        return res.status(404).json({ message: "Notification not found" });
      res.json({ message: "Notification marked as read", notification: updatedNotification });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Đánh dấu tất cả thông báo là đã đọc
  export const markAllAsReadHandler = async (req, res) => {
    try {
      const result = await markAllAsRead(req.params.userId);
      res.json({ message: "All notifications marked as read", result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Xóa một thông báo
  export const deleteNotificationHandler = async (req, res) => {
    try {
      const deletedNotification = await deleteNotification(req.params.id);
      if (!deletedNotification)
        return res.status(404).json({ message: "Notification not found" });
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Xóa tất cả thông báo của người dùng
  export const deleteAllNotificationsHandler = async (req, res) => {
    try {
      const result = await deleteAllNotificationsByUserId(req.params.userId);
      res.status(200).json({ message: "All notifications deleted successfully", result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  