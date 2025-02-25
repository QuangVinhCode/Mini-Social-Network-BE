// utils/socketMap.js

// Khởi tạo Map để lưu trữ các kết nối
const usersMap = new Map();

// Xuất khẩu Map để sử dụng ở các file khác
export const getUsersMap = () => usersMap;
export const setUserSocket = (userId, socketId) => {
  usersMap.set(userId, socketId);
};
export const removeUserSocket = (userId) => {
  usersMap.delete(userId);
};
export const getSocketByUserId = (userId) => usersMap.get(userId);
