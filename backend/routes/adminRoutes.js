import express from "express";
import Product from "../models/Product.js";
import { upload, uploadToImageKit } from "../middleware/imagekit-upload.js";
import mongoose from "mongoose";

const router = express.Router();

// POST - Add a new product
// The middleware chain first processes the file with multer (`upload.single`),
// then uploads it to ImageKit (`uploadToImageKit`), which adds the URL to req.body.
router.post("/products", upload.single('image'), uploadToImageKit, async (req, res) => {
  try {
    const { name, category, priceS, priceM, priceL, priceB, image, status } = req.body;

    if (!name || !category) {
        return res.status(400).json({ message: "Product name and category are required." });
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
    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error." });
  }
});


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
router.put("/products/:id", upload.single('image'), uploadToImageKit, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID." });
    }

    const updatedData = req.body;

    // The `uploadToImageKit` middleware adds the `image` URL to `updatedData` if a new file was uploaded.
    // If no new file, the `image` field won't be in the body, and the existing one will be preserved.

    const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!product) {
        return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product updated successfully!", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// DELETE - Delete a product
router.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Optional: delete imagekit img as well?

        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
