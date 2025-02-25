// tokenMap.js

const tokenMap = new Map(); // Tạo Map để lưu trữ token

// Hàm thêm token vào Map
export const addToken = (userId, token) => {
  tokenMap.set(userId, token);
};

// Hàm kiểm tra token trong Map
export const isTokenValid = (userId, token) => {
  return tokenMap.has(userId) && tokenMap.get(userId) === token;
};

// Hàm xóa token khỏi Map khi người dùng đăng xuất
export const removeToken = (userId) => {
  tokenMap.delete(userId);
};

// Hàm lấy token của người dùng
export const getToken = (userId) => {
  return tokenMap.get(userId);
};
