import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connection for MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "capstone_db" })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/product", productRoutes);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve the uploads folder publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Default route
app.get("/", (req, res) => {
  res.send("Backend server is running ✅");
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
