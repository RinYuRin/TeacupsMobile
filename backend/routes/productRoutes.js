// routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ GET all products
router.get("/fetch", async (req, res) => {
  try {
    const product = await Product.find();
    res.json(product);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST new product
router.post("/add", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

export default router;
