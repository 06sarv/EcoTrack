const db = require("./index");

const Emission = {
  // Log a new emission
  create: async (emission) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_LogEmission(?, ?, ?, ?, @logId)",
        [emission.userId, emission.activityId, emission.quantity, emission.notes]
      );
      
      // Get the output parameter
      const [logIdResult] = await db.pool.execute("SELECT @logId as logId");
      return logIdResult[0].logId;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's emissions by date range
  findByDateRange: async (userId, startDate, endDate) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_GetUserEmissionsByDateRange(?, ?, ?)",
        [userId, startDate, endDate]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's emissions by category
  findByCategory: async (userId, startDate, endDate) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_GetUserEmissionsByCategory(?, ?, ?)",
        [userId, startDate, endDate]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's carbon footprint trend
  getTrend: async (userId, period, startDate, endDate) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_GetUserCarbonFootprintTrend(?, ?, ?, ?)",
        [userId, period, startDate, endDate]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get emission by ID
  findById: async (logId) => {
    try {
      const emissions = await db.query(
        `SELECT e.LogID, e.UserID, e.ActivityID, e.Timestamp, e.Quantity, e.EmissionValue, e.Notes,
                a.ActivityType, a.Unit, c.CategoryName
         FROM EmissionLog e
         JOIN Activity a ON e.ActivityID = a.ActivityID
         JOIN Category c ON a.CategoryID = c.CategoryID
         WHERE e.LogID = ?`,
        [logId]
      );
      return emissions.length ? emissions[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Update an emission log
  update: async (logId, emission) => {
    try {
      // Use a transaction to ensure data consistency
      return await db.transaction(async (connection) => {
        // Get the current emission log
        const [currentEmissions] = await connection.execute(
          "SELECT UserID, ActivityID FROM EmissionLog WHERE LogID = ?",
          [logId]
        );
        
        if (!currentEmissions.length) {
          throw new Error("Emission log not found");
        }
        
        const currentEmission = currentEmissions[0];
        
        // Check if the user ID matches
        if (currentEmission.UserID !== emission.userId) {
          throw new Error("Unauthorized to update this emission log");
        }
        
        // Update the emission log
        await connection.execute(
          `UPDATE EmissionLog
           SET ActivityID = ?, Quantity = ?, Notes = ?
           WHERE LogID = ?`,
          [emission.activityId, emission.quantity, emission.notes, logId]
        );
        
        return true;
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Delete an emission log
  delete: async (logId, userId) => {
    try {
      // Check if the user owns this emission log
      const emissions = await db.query(
        "SELECT UserID FROM EmissionLog WHERE LogID = ?",
        [logId]
      );
      
      if (!emissions.length) {
        throw new Error("Emission log not found");
      }
      
      if (emissions[0].UserID !== userId) {
        throw new Error("Unauthorized to delete this emission log");
      }
      
      await db.query(
        "DELETE FROM EmissionLog WHERE LogID = ?",
        [logId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's total emissions
  getTotalEmissions: async (userId) => {
    try {
      const result = await db.query(
        `SELECT SUM(EmissionValue) as totalEmissions
         FROM EmissionLog
         WHERE UserID = ?`,
        [userId]
      );
      return result[0].totalEmissions || 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Generate weekly report
  generateWeeklyReport: async (userId, weekStartDate) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_GenerateWeeklyReport(?, ?)",
        [userId, weekStartDate]
      );
      return result[0][0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get weekly reports
  getWeeklyReports: async (userId, limit) => {
    try {
      return await db.query(
        `SELECT ReportID, WeekStartDate, WeekEndDate, TotalEmission, 
                PreviousWeekEmission, EmissionChange, GeneratedAt
         FROM WeeklyReport
         WHERE UserID = ?
         ORDER BY WeekStartDate DESC
         LIMIT ?`,
        [userId, limit]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Emission;