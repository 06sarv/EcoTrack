const db = require("./index");

const Goal = {
  // Set a new goal for a user
  create: async (goal) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_SetUserGoal(?, ?, ?, ?, ?, @goalId)",
        [goal.userId, goal.categoryId, goal.targetReduction, goal.startDate, goal.endDate]
      );
      
      // Get the output parameter
      const [goalIdResult] = await db.pool.execute("SELECT @goalId as goalId");
      return goalIdResult[0].goalId;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all goals for a user
  findByUser: async (userId) => {
    try {
      return await db.query(
        `SELECT g.GoalID, g.UserID, g.CategoryID, c.CategoryName, g.TargetReduction, 
                g.StartDate, g.EndDate, g.IsAchieved, g.CreatedAt, g.UpdatedAt
         FROM UserGoals g
         LEFT JOIN Category c ON g.CategoryID = c.CategoryID
         WHERE g.UserID = ?
         ORDER BY g.StartDate DESC`,
        [userId]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get active goals for a user
  findActiveByUser: async (userId) => {
    try {
      return await db.query(
        `SELECT g.GoalID, g.UserID, g.CategoryID, c.CategoryName, g.TargetReduction, 
                g.StartDate, g.EndDate, g.IsAchieved, g.CreatedAt, g.UpdatedAt
         FROM UserGoals g
         LEFT JOIN Category c ON g.CategoryID = c.CategoryID
         WHERE g.UserID = ? AND g.IsAchieved = FALSE AND CURDATE() BETWEEN g.StartDate AND g.EndDate
         ORDER BY g.EndDate ASC`,
        [userId]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get goal by ID
  findById: async (goalId) => {
    try {
      const goals = await db.query(
        `SELECT g.GoalID, g.UserID, g.CategoryID, c.CategoryName, g.TargetReduction, 
                g.StartDate, g.EndDate, g.IsAchieved, g.CreatedAt, g.UpdatedAt
         FROM UserGoals g
         LEFT JOIN Category c ON g.CategoryID = c.CategoryID
         WHERE g.GoalID = ?`,
        [goalId]
      );
      return goals.length ? goals[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Update a goal
  update: async (goalId, goal) => {
    try {
      await db.query(
        `UPDATE UserGoals
         SET CategoryID = ?, TargetReduction = ?, StartDate = ?, EndDate = ?
         WHERE GoalID = ? AND UserID = ? AND IsAchieved = FALSE`,
        [goal.categoryId, goal.targetReduction, goal.startDate, goal.endDate, goalId, goal.userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a goal
  delete: async (goalId, userId) => {
    try {
      await db.query(
        "DELETE FROM UserGoals WHERE GoalID = ? AND UserID = ?",
        [goalId, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get goal progress
  getProgress: async (goalId) => {
    try {
      const goals = await db.query(
        `SELECT * FROM vw_UserGoalsProgress WHERE GoalID = ?`,
        [goalId]
      );
      return goals.length ? goals[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all goals progress for a user
  getAllProgress: async (userId) => {
    try {
      return await db.query(
        `SELECT * FROM vw_UserGoalsProgress WHERE UserID = ? ORDER BY StartDate DESC`,
        [userId]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Goal;