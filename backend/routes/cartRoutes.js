import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// ✅ Add to Cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, name, image, selectedSize, addons, totalPrice, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cartItem = new Cart({
      userId,
      productId,
      name,
      image,
      selectedSize,
      addons,
      totalPrice,
      quantity: quantity || 1,
    });

    await cartItem.save();

    res.status(201).json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
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
