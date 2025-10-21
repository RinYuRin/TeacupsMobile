import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  nickname: { type: String },
  phone: { type: String },
  address: { type: String },
  image: { type: String },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
});

export default mongoose.model("User", userSchema, "users");
