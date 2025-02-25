import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB.js";
import path from "path";
import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import {
  setUserSocket,
  removeUserSocket,
  getUsersMap,
  getSocketByUserId,
} from "./config/socketMap.js"; // Nhập khẩu các hàm từ socketMap
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
const __dirname = path.resolve();
app.use("/src/img", express.static(path.join(__dirname, "src/img")));

connectDB();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
const io = new Server(server, {
  cors: {
    origin: "*", // Cần cấu hình chính xác cho môi trường production
  },
});
app.set("io", io);
let usersOnline = {};
// Lắng nghe kết nối Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Nhận thông tin đăng ký người dùng
  socket.on("register", (userId) => {
    const id = getSocketByUserId(userId);
    if (!id) {
      setUserSocket(userId, socket.id);

      console.log(`User ${userId} registered with socket ${socket.id}`);
    } else {
      console.log(`User cancel register`);
    }
  });
  socket.on("user_online", (userId) => {
    usersOnline[userId] = true;
    io.emit("online_status_update", usersOnline); // Gửi cập nhật trạng thái online cho tất cả người dùng
  });
  socket.on("messageRead", (message) => {
    // Lấy thông tin tin nhắn và tìm người gửi
    if (message) {
      const senderSocket = getSocketByUserId(message.senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("messageRead", message._id); // Thông báo tới người gửi
      }
    }
  });
  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    let usersMap = getUsersMap();
    usersMap.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        removeUserSocket(userId); // Xóa socketId khỏi Map
        console.log(`User ${userId} disconnected`);
      }
    });
    const userId = Object.keys(usersOnline).find(
      (id) => usersOnline[id] === socket.id
    );
    if (userId) {
      delete usersOnline[userId];
      io.emit("online_status_update", usersOnline); // Cập nhật lại trạng thái
    }
  });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
