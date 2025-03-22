import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const createAdminAccount = async () => {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin", 10);
    const newAdmin = new User({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("✅ Admin account created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  }
};

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully.");
    await createAdminAccount(); // Gọi hàm tạo admin ngay sau khi kết nối DB
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}
