import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  priceS: { type: String, default: "" },   // Match DB type
  priceM: { type: String, default: "" },
  priceL: { type: String, default: "" },
  priceB: { type: String, default: "" },
  status: { type: String, default: "Activated" },
  image: { type: String, default: "" },
});

export default mongoose.model("Product", productSchema, "product");
