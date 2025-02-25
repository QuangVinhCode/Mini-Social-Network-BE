import multer from "multer";
import path from "path";

// Cấu hình thư mục lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("src/img")); // Thư mục lưu hình ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}`); // Đặt tên file
  },
});

// Kiểm tra loại file hợp lệ
const fileFilter = (req, file, cb) => {
  // const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Cho phép tệp
  } else {
    cb(new Error("Only image formats are allowed"), false); // Từ chối tệp
  }
};

// Middleware upload file
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
