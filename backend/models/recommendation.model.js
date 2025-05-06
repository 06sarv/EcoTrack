const db = require("./index");

const Recommendation = {
  // Get all recommendations
  findAll: async () => {
    try {
      return await db.query(
        `SELECT r.RecID, r.Suggestion, r.PotentialImpact, r.Difficulty, 
                c.CategoryID, c.CategoryName
         FROM Recommendations r
         JOIN Category c ON r.CategoryID = c.CategoryID
         ORDER BY c.CategoryName, r.PotentialImpact DESC`
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get recommendations by category
  findByCategory: async (categoryId) => {
    try {
      return await db.query(
        `SELECT r.RecID, r.Suggestion, r.PotentialImpact, r.Difficulty, 
                c.CategoryID, c.CategoryName
         FROM Recommendations r
         JOIN Category c ON r.CategoryID = c.CategoryID
         WHERE r.CategoryID = ?
         ORDER BY r.PotentialImpact DESC`,
        [categoryId]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get recommendation by ID
  findById: async (recId) => {
    try {
      const recommendations = await db.query(
        `SELECT r.RecID, r.Suggestion, r.PotentialImpact, r.Difficulty, 
                c.CategoryID, c.CategoryName
         FROM Recommendations r
         JOIN Category c ON r.CategoryID = c.CategoryID
         WHERE r.RecID = ?`,
        [recId]
      );
      return recommendations.length ? recommendations[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Create a new recommendation
  create: async (recommendation) => {
    try {
      const result = await db.query(
        `INSERT INTO Recommendations (CategoryID, Suggestion, PotentialImpact, Difficulty)
         VALUES (?, ?, ?, ?)`,
        [recommendation.categoryId, recommendation.suggestion, recommendation.potentialImpact, recommendation.difficulty]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update a recommendation
  update: async (recId, recommendation) => {
    try {
      await db.query(
        `UPDATE Recommendations
         SET CategoryID = ?, Suggestion = ?, PotentialImpact = ?, Difficulty = ?
         WHERE RecID = ?`,
        [recommendation.categoryId, recommendation.suggestion, recommendation.potentialImpact, recommendation.difficulty, recId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a recommendation
  delete: async (recId) => {
    try {
      await db.query(
        "DELETE FROM Recommendations WHERE RecID = ?",
        [recId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get personalized recommendations for a user
  getPersonalizedRecommendations: async (userId, limit) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_GetPersonalizedRecommendations(?, ?)",
        [userId, limit]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Mark a recommendation as implemented by a user
  markAsImplemented: async (userId, recId) => {
    try {
      await db.pool.execute(
        "CALL sp_MarkRecommendationAsImplemented(?, ?)",
        [userId, recId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's implemented recommendations
  getUserImplementedRecommendations: async (userId) => {
    try {
      return await db.query(
        `SELECT r.RecID, r.Suggestion, r.PotentialImpact, r.Difficulty, 
                c.CategoryID, c.CategoryName, ur.ImplementedDate
         FROM UserRecommendations ur
         JOIN Recommendations r ON ur.RecID = r.RecID
         JOIN Category c ON r.CategoryID = c.CategoryID
         WHERE ur.UserID = ? AND ur.IsImplemented = TRUE
         ORDER BY ur.ImplementedDate DESC`,
        [userId]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Recommendation;