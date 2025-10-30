import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'In Stock' },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'inventory' });

// Use export default for ES Modules
export default mongoose.model('Inventory', InventorySchema);