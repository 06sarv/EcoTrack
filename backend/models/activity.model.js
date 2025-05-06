const db = require("./index");

const Activity = {
  // Get all activities
  findAll: async () => {
    try {
      return await db.query(
        `SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, 
                a.Description, c.CategoryID, c.CategoryName 
         FROM Activity a
         JOIN Category c ON a.CategoryID = c.CategoryID
         ORDER BY c.CategoryName, a.ActivityType`
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get activities by category
  findByCategory: async (categoryId) => {
    try {
      return await db.query(
        `SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, 
                a.Description, c.CategoryID, c.CategoryName 
         FROM Activity a
         JOIN Category c ON a.CategoryID = c.CategoryID
         WHERE a.CategoryID = ?
         ORDER BY a.ActivityType`,
        [categoryId]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get activity by ID
  findById: async (activityId) => {
    try {
      const activities = await db.query(
        `SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, 
                a.Description, c.CategoryID, c.CategoryName 
         FROM Activity a
         JOIN Category c ON a.CategoryID = c.CategoryID
         WHERE a.ActivityID = ?`,
        [activityId]
      );
      return activities.length ? activities[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Create a new activity
  create: async (activity) => {
    try {
      const result = await db.query(
        `INSERT INTO Activity (ActivityType, CarbonEmissionRate, CategoryID, Unit, Description)
         VALUES (?, ?, ?, ?, ?)`,
        [activity.activityType, activity.carbonEmissionRate, activity.categoryId, activity.unit, activity.description]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update an activity
  update: async (activityId, activity) => {
    try {
      await db.query(
        `UPDATE Activity
         SET ActivityType = ?, CarbonEmissionRate = ?, CategoryID = ?, Unit = ?, Description = ?
         WHERE ActivityID = ?`,
        [activity.activityType, activity.carbonEmissionRate, activity.categoryId, activity.unit, activity.description, activityId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete an activity
  delete: async (activityId) => {
    try {
      // Check if the activity is used in any emission logs
      const logs = await db.query(
        "SELECT COUNT(*) as count FROM EmissionLog WHERE ActivityID = ?",
        [activityId]
      );
      
      if (logs[0].count > 0) {
        throw new Error("Cannot delete activity that is used in emission logs");
      }
      
      await db.query(
        "DELETE FROM Activity WHERE ActivityID = ?",
        [activityId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Search activities by keyword
  search: async (keyword) => {
    try {
      return await db.query(
        `SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, 
                a.Description, c.CategoryID, c.CategoryName 
         FROM Activity a
         JOIN Category c ON a.CategoryID = c.CategoryID
         WHERE a.ActivityType LIKE ? OR a.Description LIKE ?
         ORDER BY c.CategoryName, a.ActivityType`,
        [`%${keyword}%`, `%${keyword}%`]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Activity;