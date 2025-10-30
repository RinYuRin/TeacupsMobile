import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  size: { type: String },
  addons: { type: [String], default: [] },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 },
  product: { type: mongoose.Schema.Types.Mixed, required: false },
});

const PurchaseSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Customer' },
  items: { type: [PurchaseItemSchema], required: true },
  total: { type: Number, required: true, default: 0 },
  paid: { type: Number, required: true, default: 0 },
  change: { type: Number, required: true, default: 0 },
  cashier: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'purchase' });

export default mongoose.model('Purchase', PurchaseSchema);