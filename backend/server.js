import dotenv from "dotenv";
dotenv.config();
console.log("SERVER.JS: PubKey =", process.env.IMGKIT_PUBKEY);

import express from "express";
import mongoose from "mongoose";
//import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

//dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Logging Setup ======
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});

morgan.token("timestamp", () => new Date().toISOString());
app.use(
  morgan(":timestamp | :method :url | :status | :response-time ms", {
    stream: accessLogStream,
  })
);

app.use(
  morgan("dev", {
    skip: (req, res) => res.statusCode < 400,
  })
);

// ====== Middleware ======
app.use(express.json());
app.use(cors());

// ====== MongoDB Connection ======
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "capstone_db" })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== Routes ======
app.use("/api", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ====== Static Files ======
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== Default Route ======
app.get("/", (req, res) => {
  res.send("✅ Backend server is running smoothly!");
});

// ====== Error Handling ======
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(500).json({ message: "Internal server error" });
});

// ====== Start Server ======
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
