import jwt from "jsonwebtoken";
import { isTokenValid } from "../config/tokenMap.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ header Authorization
  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Xác thực token
    req.user = decoded; // Gắn thông tin người dùng vào req để sử dụng ở các handler
    if (!isTokenValid(decoded.userId, token)) {
      return res.status(401).json({ message: "Token không thuộc về user." });
    }
    next(); // Tiếp tục xử lý
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ." });
  }
};
