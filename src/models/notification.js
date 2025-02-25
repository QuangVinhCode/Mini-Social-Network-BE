import mongoose from "mongoose";

// Định nghĩa schema cho Notification
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến collection 'users'
      required: true,
    },
    type: {
      type: String, // Loại thông báo (ví dụ: "message", "comment", "like")
      required: true,
    },
    message: {
      type: String, // Nội dung thông báo
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false, // Tắt lưu trường __v
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo model Notification từ schema
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
