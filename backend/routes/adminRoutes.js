import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // --- 1. IMPORT BCRYPT ---
import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  upload,
  uploadToImageKit,
  uploadProfileToImageKit,
} from "../middleware/imagekit-upload.js";

// Declare the router ONCE
const router = express.Router();

// === USER ROUTES ===

// User Profile Update Route (now at /api/admin/user/update-profile)
router.post(
  "/user/update-profile",
  upload.single("image"), // 1. Multer catches the 'image' file
  uploadProfileToImageKit, // 2. Middleware uploads it to ImageKit "/user_profile/"
  async (req, res) => {
    try {
      // We get userId, username, etc. from the form data
      const { userId, username, nickname, email, phone, address } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Update text fields
      user.username = username || user.username;
      user.nickname = nickname || user.nickname;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      // Update image ONLY if a new one was uploaded
      // req.body.image contains the new ImageKit URL from the middleware
      if (req.body.image) {
        user.image = req.body.image;
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

// --- 2. ADDED CHANGE PASSWORD ROUTE ---
// This route is now available at /api/admin/user/change-password
router.post("/user/change-pass", async (req, res) => {
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

// === PRODUCT ROUTES ===

// POST - Add a new product
// The middleware chain first processes the file with multer (`upload.single`),
// then uploads it to ImageKit (`uploadToImageKit`), which adds the URL to req.body.
router.post(
  "/products",
  upload.single("image"),
  uploadToImageKit,
  async (req, res) => {
    try {
      const { name, category, priceS, priceM, priceL, priceB, image, status } =
        req.body;

      if (!name || !category) {
        return res
          .status(400)
          .json({ message: "Product name and category are required." });
      }

      const newProduct = new Product({
        name,
        category,
        priceS,
        priceM,
        priceL,
        priceB,
        image, // This will be the URL from ImageKit
        status,
      });

      await newProduct.save();
      res
        .status(201)
        .json({ message: "Product added successfully!", product: newProduct });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// GET - Fetch all products (for the admin dashboard)
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// PUT - Update an existing product
router.put(
  "/products/:id",
  upload.single("image"),
  uploadToImageKit,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID." });
      }

      const updatedData = req.body;

      // The `uploadToImageKit` middleware adds the `image` URL to `updatedData` if a new file was uploaded.
      // If no new file, the `image` field won't be in the body, and the existing one will be preserved.

      const product = await Product.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      res.json({ message: "Product updated successfully!", product });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// DELETE - Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    // --- This is the corrected part ---
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error." });
  }
});
// --- End of corrected part ---

// The one and only export at the end of the file
export default router;
