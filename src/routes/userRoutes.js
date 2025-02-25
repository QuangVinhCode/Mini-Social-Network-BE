import express from "express";
import {
  createUserHandler,
  getUserHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  loginUserHandler,
  sendFriendRequestHandler,
  cancelFriendRequestHandler,
  acceptFriendRequestHandler,
  declineFriendRequestHandler,
  findUsersBySimilarNameHandler,
} from "../controllers/userController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";

const userRouter = express.Router();

// POST: Tạo người dùng mới
userRouter.post("/", createUserHandler);

// GET: Lấy thông tin tất cả người dùng
userRouter.get("/", authenticateToken, getAllUsersHandler);

// GET: Lấy thông tin một người dùng
userRouter.get("/:id", getUserHandler);

// PUT: Cập nhật thông tin người dùng
userRouter.put(
  "/:id",
  authenticateToken,
  upload.array("images", 5),
  updateUserHandler
);

userRouter.delete("/:id", authenticateToken, deleteUserHandler);

userRouter.patch("/", loginUserHandler);

userRouter.get("/", getAllUsersHandler);

userRouter.post("/request-add-friend", authenticateToken, (req, res) =>
  sendFriendRequestHandler(req, res, req.app.get("io"))
);

userRouter.delete("/:userId/request-remove-friend/:targetId", authenticateToken, (req, res) =>
  cancelFriendRequestHandler(req, res, req.app.get("io"))
);

userRouter.post("/add-friend", authenticateToken, (req, res) =>
  acceptFriendRequestHandler(req, res, req.app.get("io"))
);

userRouter.delete("/:userId/remove-friend/:requesterId", authenticateToken, (req, res) =>
  declineFriendRequestHandler(req, res, req.app.get("io"))
);

userRouter.get("/search/:name", findUsersBySimilarNameHandler);

export default userRouter;
