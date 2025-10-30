import express from 'express';
import Inventory from '../models/Inventory.js'; // Import the new model

const router = express.Router();

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, stock } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const s = Number(stock) || 0;
    let status = 'In Stock';
    if (s === 0) status = 'Out of Stock';
    else if (s < 15) status = 'Low Stock'; // Your desktop logic (reorder at 15)

    const item = new Inventory({ name, stock: s, status });
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE an inventory item (this is what your "Edit Stock" modal will use)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, stock } = req.body; // Get name and stock from body

    const s = Number(stock) || 0;
    let status = 'In Stock';
    if (s === 0) status = 'Out of Stock';
    else if (s < 15) status = 'Low Stock'; // Your desktop logic

    // Find and update the item
    const updated = await Inventory.findByIdAndUpdate(
      id, 
      { name, stock: s, status }, // Update these fields
      { new: true } // Return the new, updated document
    );
    
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Inventory.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;