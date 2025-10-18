import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";

const router = express.Router();

// ✅ PATCH - Increment cart item quantity
router.patch("/increment/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const updatedItem = await Cart.findByIdAndUpdate(
      cartItemId,
      { $inc: { quantity: 1 } }, // Use MongoDB's $inc operator to increment
      { new: true } // Return the updated document
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ PATCH - Decrement cart item quantity
router.patch("/decrement/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const item = await Cart.findById(cartItemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    // If quantity is 1, decrementing should remove it
    if (item.quantity <= 1) {
      await Cart.findByIdAndDelete(cartItemId);
      return res.json({ message: "Item removed from cart." });
    }

    // Otherwise, just decrement the quantity
    item.quantity -= 1;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// DELETE a specific item from the cart
router.delete("/remove/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID." });
    }

    const result = await Cart.findByIdAndDelete(cartItemId);

    if (!result) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.json({ message: "Item removed from cart successfully." });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Add to Cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, name, image, selectedSize, addons, totalPrice, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      selectedSize,
      addons: { $all: addons, $size: addons.length },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();

      return res.json({
        message: "Quantity updated for existing cart item",
        cartItem: existingCartItem,
      });
    }

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

// Get all items in cart for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    const items = await Cart.find({ userId }).populate("productId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
