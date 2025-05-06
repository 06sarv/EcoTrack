const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Dashboard summary endpoint
router.get('/summary', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Weekly emissions (last 7 days)
    const [weekly] = await pool.query(
      `SELECT SUM(EmissionValue) AS total FROM EmissionLog WHERE UserID = ? AND Timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    // Previous week emissions (7-14 days ago)
    const [prevWeek] = await pool.query(
      `SELECT SUM(EmissionValue) AS total FROM EmissionLog WHERE UserID = ? AND Timestamp >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND Timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    // Monthly average (last 30 days)
    const [monthly] = await pool.query(
      `SELECT AVG(daily_total) AS monthly_avg FROM (
        SELECT DATE(Timestamp) as day, SUM(EmissionValue) as daily_total
        FROM EmissionLog WHERE UserID = ? AND Timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY day
      ) as daily`,
      [userId]
    );
    // Emissions by category (last 7 days)
    const [byCategory] = await pool.query(
      `SELECT c.CategoryName, SUM(e.EmissionValue) AS total
       FROM EmissionLog e
       JOIN Activity a ON e.ActivityID = a.ActivityID
       JOIN Category c ON a.CategoryID = c.CategoryID
       WHERE e.UserID = ? AND e.Timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY c.CategoryName`,
      [userId]
    );
    // Emissions over time (last 30 days, for graph)
    const [overTime] = await pool.query(
      `SELECT DATE(Timestamp) as day, SUM(EmissionValue) as total
       FROM EmissionLog WHERE UserID = ? AND Timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY day ORDER BY day ASC`,
      [userId]
    );
    // Calculate CO2 saved (previous week - this week, if positive)
    const co2Saved = Math.max((prevWeek[0].total || 0) - (weekly[0].total || 0), 0);
    res.json({
      weeklyEmissions: weekly[0].total || 0,
      monthlyAverage: monthly[0].monthly_avg || 0,
      emissionsByCategory: byCategory,
      emissionsOverTime: overTime,
      co2Saved
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 