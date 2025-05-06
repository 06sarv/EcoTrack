const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Recommendations endpoint
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Get distinct categories the user has logged activities in
    const [categories] = await pool.query(
      `SELECT DISTINCT a.CategoryID, c.CategoryName
       FROM EmissionLog e
       JOIN Activity a ON e.ActivityID = a.ActivityID
       JOIN Category c ON a.CategoryID = c.CategoryID
       WHERE e.UserID = ?`,
      [userId]
    );
    if (categories.length === 0) {
      // If no activity, return all recommendations
      const [allRecs] = await pool.query(
        'SELECT c.CategoryName, r.Suggestion FROM Recommendations r JOIN Category c ON r.CategoryID = c.CategoryID'
      );
      return res.json({ recommendations: allRecs });
    }
    // Get recommendations for those categories
    const categoryIds = categories.map(cat => cat.CategoryID);
    const [recs] = await pool.query(
      `SELECT c.CategoryName, r.Suggestion
       FROM Recommendations r
       JOIN Category c ON r.CategoryID = c.CategoryID
       WHERE r.CategoryID IN (${categoryIds.map(() => '?').join(',')})`,
      categoryIds
    );
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 