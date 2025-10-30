import express from 'express';
import Purchase from '../models/Purchase.js'; // Import model directly

const router = express.Router();

// POST /api/purchase - Create a purchase
router.post('/', async (req, res) => {
  try {
    const { customerName = 'Customer', items, total = 0, paid = 0, change = 0, cashier = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Basic validation for items
    for (const it of items) {
      if (typeof it.qty !== 'number' || typeof it.price !== 'number') {
        return res.status(400).json({ message: 'Invalid item format: qty and price must be numbers' });
      }
    }

    const purchase = new Purchase({ customerName, items, total: Number(total), paid: Number(paid), change: Number(change), cashier });
    const saved = await purchase.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating purchase:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/purchase - List purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 }).limit(200);
    return res.json(purchases);
  } catch (err) {
    console.error('Error fetching purchases:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/purchase/count - Get unique customer count
router.get('/count', async (req, res) => {
  try {
    const names = await Purchase.distinct('customerName', { customerName: { $exists: true, $ne: null, $ne: '' } });
    const count = Array.isArray(names) ? names.length : 0;
    return res.json({ count });
  } catch (err) {
    console.error('Error fetching customer count:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/purchase/stats - Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { range = 'day', date: dateString } = req.query;

    let startDate, endDate;
    let chartGroupFormat;
    let chartLabelFormat;

    const refDate = dateString ? new Date(dateString + 'T00:00:00') : new Date();
    refDate.setHours(0, 0, 0, 0);

    switch (range) {
      case 'year':
        startDate = new Date(refDate.getFullYear(), 0, 1);
        endDate = new Date(refDate.getFullYear() + 1, 0, 1);
        chartGroupFormat = "%Y-%m";
        chartLabelFormat = "%b";
        break;
      case 'month':
        startDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        endDate = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
        chartGroupFormat = "%Y-%m-%d";
        chartLabelFormat = "%b %d";
        break;
      case 'week':
        startDate = new Date(refDate);
        startDate.setDate(refDate.getDate() - refDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        chartGroupFormat = "%Y-%m-%d";
        chartLabelFormat = "%a %d";
        break;
      case 'day':
      default:
        startDate = new Date(refDate);
        endDate = new Date(refDate);
        endDate.setDate(refDate.getDate() + 1);
        chartGroupFormat = "%Y-%m-%dT%H:00:00";
        chartLabelFormat = "%I %p";
        break;
    }

    const matchCriteria = {
      createdAt: { $gte: startDate, $lt: endDate }
    };

    // 3a. Total Revenue
    const revenueResult = await Purchase.aggregate([
      { $match: matchCriteria },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);

    // 3b. Total Purchased Products
    const itemsResult = await Purchase.aggregate([
      { $match: matchCriteria },
      { $unwind: '$items' },
      { $group: { _id: null, totalPurchasedProducts: { $sum: '$items.qty' } } }
    ]);

    // 3c. Best Selling Product
    const bestSellerResult = await Purchase.aggregate([
      { $match: matchCriteria },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQuantity: { $sum: '$items.qty' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 }
    ]);

    // 3d. Chart Data
    const timezone = "Asia/Manila"; // IMPORTANT: Set your local timezone
    const chartData = await Purchase.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { $dateToString: { format: chartGroupFormat, date: "$createdAt", timezone: timezone } },
          dailyRevenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const labels = chartData.map(d => d._id);
    const data = chartData.map(d => d.dailyRevenue);

    const bestSeller = bestSellerResult.length > 0
      ? { name: bestSellerResult[0]._id, quantity: bestSellerResult[0].totalQuantity }
      : { name: 'N/A', quantity: 0 };

    // Combine all stats
    const stats = {
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
      totalPurchasedProducts: itemsResult.length > 0 ? itemsResult[0].totalPurchasedProducts : 0,
      bestSeller: bestSeller,
      chart: {
        labels: labels,
        data: data,
        labelFormat: chartLabelFormat,
        query: { range, dateString, startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      }
    };

    return res.json(stats);

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;