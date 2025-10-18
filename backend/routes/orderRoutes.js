import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// Create a new order from cart items
router.post("/create", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const cartItems = await Cart.find({ userId });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const grandTotal = cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);

    const newOrder = new Order({
      userId,
      items: cartItems.map(item => ({
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

    // After creating the order, clear the user's cart
    await Cart.deleteMany({ userId });

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error while placing order." });
  }
});

// Fetch all orders for a specific user
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
