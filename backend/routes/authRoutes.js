import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { upload, uploadProfileToImageKit } from "../middleware/imagekit-upload.js";

const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot Password - Request OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Send a generic response to prevent email enumeration
      return res.json({
        message: "If an account with that email exists, a password reset OTP has been sent.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: `TeaCUPS Support <${process.env.EMAIL_USER}>`,
      subject: "Your TeaCUPS Password Reset OTP",
      text: `Your OTP is: ${otp}\n\nThis OTP will expire in one hour.`,
    });

    res.json({
      message: "If an account with that email exists, a password reset OTP has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired." });
    }

    // OTP is valid
    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Reset Password - Verify OTP and set new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired." });
    }

    // Hash new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Change Password Route (from Profile page)
router.post("/user/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Compare old password hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password." });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error during password change." });
  }
});

// SIGNUP route (with User Role)
router.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body; // Added role

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      username: email, // Default username
      role: role || 'user', // Add role, default to 'user'
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully. You can now log in." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login route (with Hashed Password Check)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Use generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- CRITICAL FIX ---
    // Use bcrypt.compare to check the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // --- END FIX ---

    // Send back user data (including role) but remove the password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: "Login successful", user: userResponse });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// NEW User Profile Update Route
router.post(
  "/user/update-profile",
  upload.single("image"), // 1. Multer catches the 'image' file
  uploadProfileToImageKit, // 2. Our new middleware uploads it to ImageKit
  async (req, res) => {
    try {
      const { userId, username, nickname, email, phone, address } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // --- ✅ START: MODIFICATION ---
      // For required fields, keep the old value if the new one is empty
      user.username = username || user.username;
      user.email = email || user.email;

      // For optional fields, allow them to be cleared
      // We check if the value was sent (it'll be "" if blank, or "new value")
      if (nickname !== undefined) {
        user.nickname = nickname;
      }
      if (phone !== undefined) {
        user.phone = phone;
      }
      if (address !== undefined) {
        user.address = address;
      }
      // --- ✅ END: MODIFICATION ---

      // Update image ONLY if a new one was uploaded
      if (req.body.image) {
        user.image = req.body.image; // This URL comes from uploadProfileToImageKit
      }

      await user.save();

      // Send back the updated user, minus password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: "Profile updated successfully!",
        user: userResponse,
      });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Server error during profile update." });
    }
  }
);

// GET all users (for dashboard analytics)
router.get("/users", async (req, res) => {
  try {
    // Find all users but only select the 'createdAt' and 'role' fields
    // This is more secure as it avoids sending passwords or personal info
    const users = await User.find({}, 'createdAt role');
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users." });
  }
});

export default router;