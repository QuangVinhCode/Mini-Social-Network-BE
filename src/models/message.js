import mongoose from "mongoose";

// Định nghĩa schema cho Message
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến collection 'users'
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến collection 'users'
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false, // Tắt lưu trường __v
    timestamps: true,
  }
);

// Tạo model Message từ schema
const Message = mongoose.model("Message", messageSchema);

export default Message;
