import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB.js";
import path from "path";
import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import redisClient from "./config/redisClient.js";

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
    origin: "*",
  },
});
app.set("io", io);

// Lắng nghe kết nối Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", async (userId) => {
    await redisClient.hSet("online_users", userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("user_online", async (userId) => {
    await redisClient.hSet("online_users", userId, socket.id);
    const usersOnline = await redisClient.hGetAll("online_users");
    io.emit("online_status_update", usersOnline);
  });

  socket.on("online_status", async () => {
    const usersOnline = await redisClient.hGetAll("online_users");
    io.emit("online_status_update", usersOnline);
  });

  socket.on("messageRead", async (message) => {
    if (message) {
      const senderSocket = await redisClient.hGet(
        "online_users",
        message.senderId
      );
      if (senderSocket) {
        io.to(senderSocket).emit("messageRead", message._id);
        await redisClient.hDel("unread_messages", message._id);
      }
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const usersOnline = await redisClient.hGetAll("online_users");
    const userId = Object.keys(usersOnline).find(
      (id) => usersOnline[id] === socket.id
    );
    if (userId) {
      await redisClient.hDel("online_users", userId);
      console.log(`User ${userId} removed from online list`);
      io.emit("online_status_update", usersOnline);
    }
  });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);

const clearRedisOnExit = async () => {
  console.log("Clearing Redis data before exit...");
  await redisClient.del("online_users");
  await redisClient.del("token_users");
  console.log("Redis cleared!");
};

process.on("SIGINT", async () => {
  await clearRedisOnExit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await clearRedisOnExit();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
