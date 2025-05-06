const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get activities by category
router.get('/', authenticateToken, async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, a.Description, c.CategoryName FROM Activity a JOIN Category c ON a.CategoryID = c.CategoryID';
    let params = [];
    if (category) {
      query += ' WHERE c.CategoryName = ?';
      params.push(category);
    }
    const [rows] = await pool.query(query, params);
    res.json({ activities: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Log Activity (updated)
router.post('/log', authenticateToken, async (req, res) => {
  const { 
    activityId, // This is now the activity type string
    quantity, 
    date, 
    notes,
    // Transportation specific
    transportationType,
    numPassengers,
    // Food specific
    mealType,
    foodSource,
    // Energy specific
    energySource
  } = req.body;
  const userId = req.user.userId;

  // Debug logging
  console.log('Received activityId:', activityId);
  console.log('Received quantity:', quantity);

  if (!activityId || !quantity || quantity <= 0) {
    console.log('Invalid input check failed:', { activityId, quantity });
    return res.status(400).json({ message: 'Invalid input.' });
  }

  try {
    // Get emission rate and category for the activity type
    const [activityRows] = await pool.query(
      'SELECT a.ActivityID, a.CarbonEmissionRate, c.CategoryName FROM Activity a JOIN Category c ON a.CategoryID = c.CategoryID WHERE a.ActivityType = ?',
      [activityId]
    );
    console.log('Activity lookup result:', activityRows);
    
    if (activityRows.length === 0) {
      console.log('Activity not found for type:', activityId);
      return res.status(404).json({ message: 'Activity not found.' });
    }
    
    const { ActivityID, CarbonEmissionRate, CategoryName } = activityRows[0];

    // Calculate emission value based on category
    let emissionValue = quantity * CarbonEmissionRate;
    
    // Adjust for transportation with passengers
    if (CategoryName === 'Transportation' && numPassengers && numPassengers > 0) {
      emissionValue = (quantity * CarbonEmissionRate) / numPassengers;
    }

    // Insert into EmissionLog with category-specific fields
    const [result] = await pool.query(
      `INSERT INTO EmissionLog (
        UserID, ActivityID, Quantity, EmissionValue, Timestamp, Notes,
        TransportationType, NumPassengers,
        MealType, FoodSource,
        EnergySource
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, ActivityID, quantity, emissionValue, date || new Date(), notes,
        transportationType || null, numPassengers || null,
        mealType || null, foodSource || null,
        energySource || null
      ]
    );

    res.status(201).json({ 
      message: 'Activity logged successfully.',
      emissionValue,
      logId: result.insertId
    });
  } catch (err) {
    console.error('Error logging activity:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 