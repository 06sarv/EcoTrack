const db = require("./index");

const Category = {
  // Get all categories
  findAll: async () => {
    try {
      return await db.query(
        "SELECT CategoryID, CategoryName, Description FROM Category ORDER BY CategoryName"
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get category by ID
  findById: async (categoryId) => {
    try {
      const categories = await db.query(
        "SELECT CategoryID, CategoryName, Description FROM Category WHERE CategoryID = ?",
        [categoryId]
      );
      return categories.length ? categories[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Create a new category
  create: async (category) => {
    try {
      const result = await db.query(
        "INSERT INTO Category (CategoryName, Description) VALUES (?, ?)",
        [category.categoryName, category.description]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update a category
  update: async (categoryId, category) => {
    try {
      await db.query(
        "UPDATE Category SET CategoryName = ?, Description = ? WHERE CategoryID = ?",
        [category.categoryName, category.description, categoryId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a category
  delete: async (categoryId) => {
    try {
      // Check if the category is used in any activities
      const activities = await db.query(
        "SELECT COUNT(*) as count FROM Activity WHERE CategoryID = ?",
        [categoryId]
      );
      
      if (activities[0].count > 0) {
        throw new Error("Cannot delete category that is used in activities");
      }
      
      // Check if the category is used in any recommendations
      const recommendations = await db.query(
        "SELECT COUNT(*) as count FROM Recommendations WHERE CategoryID = ?",
        [categoryId]
      );
      
      if (recommendations[0].count > 0) {
        throw new Error("Cannot delete category that is used in recommendations");
      }
      
      await db.query(
        "DELETE FROM Category WHERE CategoryID = ?",
        [categoryId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get category with activities
  findWithActivities: async (categoryId) => {
    try {
      const categories = await db.query(
        `SELECT c.CategoryID, c.CategoryName, c.Description
         FROM Category c
         WHERE c.CategoryID = ?`,
        [categoryId]
      );
      
      if (!categories.length) {
        return null;
      }
      
      const category = categories[0];
      
      const activities = await db.query(
        `SELECT a.ActivityID, a.ActivityType, a.CarbonEmissionRate, a.Unit, a.Description
         FROM Activity a
         WHERE a.CategoryID = ?
         ORDER BY a.ActivityType`,
        [categoryId]
      );
      
      category.activities = activities;
      
      return category;
    } catch (error) {
      throw error;
    }
  },
  
  // Get category with recommendations
  findWithRecommendations: async (categoryId) => {
    try {
      const categories = await db.query(
        `SELECT c.CategoryID, c.CategoryName, c.Description
         FROM Category c
         WHERE c.CategoryID = ?`,
        [categoryId]
      );
      
      if (!categories.length) {
        return null;
      }
      
      const category = categories[0];
      
      const recommendations = await db.query(
        `SELECT r.RecID, r.Suggestion, r.PotentialImpact, r.Difficulty
         FROM Recommendations r
         WHERE r.CategoryID = ?
         ORDER BY r.PotentialImpact DESC`,
        [categoryId]
      );
      
      category.recommendations = recommendations;
      
      return category;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Category;