import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  selectedSize: { type: String },
  addons: [{ type: String }],
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
}, { _id: false }); // _id is not needed for subdocuments

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Preparing", "Ready to Pick Up", "Completed", "Cancelled"],
      default: "Preparing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema, "orders");
