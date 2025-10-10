import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";

const router = express.Router();

// Add to Cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, name, image, selectedSize, addons, totalPrice, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // ✅ Check if item already exists in user's cart
    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      selectedSize,
      addons: { $all: addons, $size: addons.length }, // match same addons exactly
    });

    if (existingCartItem) {
      // ✅ Same drink, size, and addons → just increase quantity
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();

      return res.json({
        message: "Quantity updated for existing cart item",
        cartItem: existingCartItem,
      });
    }

    // ✅ Otherwise, create new cart entry
    const newCartItem = new Cart({
      userId,
      productId,
      name,
      image,
      selectedSize,
      addons,
      totalPrice,
      quantity: quantity || 1,
    });

    await newCartItem.save();

    res.status(201).json({
      message: "New cart item added successfully",
      cartItem: newCartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Get all items in cart for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Cart.find({ userId }).populate("productId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
