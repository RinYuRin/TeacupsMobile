import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
// No need to import Product model, $lookup uses the collection name

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

// GET all orders (for admin dashboard)
router.get("/all", async (req, res) => {
  try {
    // Find all orders, and select status, createdAt, grandTotal, AND items
    const orders = await Order.find({}, 'status createdAt grandTotal items');
    res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- NEW REPORT ROUTE 1: Sales by Month ---
router.get("/reports/sales-by-month", async (req, res) => {
  try {
    const salesByMonth = await Order.aggregate([
      {
        $match: { status: "Completed" }, // Only 'Completed' orders
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalSales: { $sum: "$grandTotal" }, // Sum the grandTotal
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by date
      },
    ]);

    // Format for chart-kit
    const labels = salesByMonth.map(item => {
      const monthName = new Date(item._id.year, item._id.month - 1, 1)
                        .toLocaleString('default', { month: 'short' });
      return `${monthName} ${item._id.year}`;
    });
    const data = salesByMonth.map(item => item.totalSales);

    res.json({
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [{ data: data.length > 0 ? data : [0] }],
    });

  } catch (error) {
    console.error("Fetch sales report error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// --- NEW REPORT ROUTE 2: Sales by Category ---
router.get("/reports/sales-by-category", async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      {
        $match: { status: "Completed" }, // Only 'Completed' orders
      },
      {
        $unwind: "$items", // Deconstruct the items array
      },
      {
        $lookup: {
          from: "product", // Collection name from Product.js model
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Deconstruct the lookup result
      },
      {
        $group: {
          _id: "$productDetails.category", // Group by product category
          totalSales: { $sum: "$items.totalPrice" }, // Sum the total price of each item
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort by most sales
      },
    ]);

    // Format for chart-kit
    const labels = salesByCategory.map(item => item._id);
    const data = salesByCategory.map(item => item.totalSales);

    res.json({
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [{ data: data.length > 0 ? data : [0] }],
    });

  } catch (error) {
    console.error("Fetch category report error:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// Fetch all orders for a specific user (no change)
// THIS MUST BE AFTER THE '/reports/...' routes
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