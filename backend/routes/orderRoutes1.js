import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// Create a new order from SELECTED cart items
router.post("/create", async (req, res) => {
  try {
    // 1. Get userId AND the array of selected cartItemIds from the body
    const { userId, cartItemIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // 2. Validate that cartItemIds is an array
    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({ message: "No items selected." });
    }

    // 3. Find only the cart items that were selected and belong to the user
    const cartItems = await Cart.find({
      _id: { $in: cartItemIds },
      userId: userId,
    });

    if (cartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid cart items found for this user." });
    }

    // 4. Calculate grandTotal based on *only* the selected items
    const grandTotal = cartItems.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    );

    const newOrder = new Order({
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        selectedSize: item.selectedSize,
        addons: item.addons,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      grandTotal,
    });

    await newOrder.save();

    // 5. After creating the order, clear ONLY the purchased items from the user's cart
    await Cart.deleteMany({
      _id: { $in: cartItemIds },
      userId: userId,
    });

    res
      .status(201)
      .json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error while placing order." });
  }
});

// --- MODIFIED ROUTE ---
// GET all orders (for admin dashboard)
// This MUST be defined *before* the '/:userId' route
router.get("/all", async (req, res) => {
  try {
    // Find all orders, and select status, createdAt, AND grandTotal
    const orders = await Order.find({}, 'status createdAt grandTotal');
    res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
});
// --- END MODIFIED ROUTE ---


// Fetch all orders for a specific user (no change)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Newest first
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;