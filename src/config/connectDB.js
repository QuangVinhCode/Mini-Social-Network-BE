import mongoose from "mongoose";

const connectDB = async () => {
    const mongoURI = process.env.DB_URL; // Thay "mydatabase" bằng tên cơ sở dữ liệu của bạn
    try {
        await mongoose.connect(mongoURI);
        console.log("Kết nối tới MongoDB thành công!");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
        process.exit(1); // Thoát nếu kết nối thất bại
    }
};

export default connectDB;
