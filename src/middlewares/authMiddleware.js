import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isTokenValid = await redisClient.hGet("token_users", decoded.userId);
    if (token != isTokenValid) {
      return res.status(402).json({ message: "Token không thuộc về user." });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ." });
  }
};
