const db = require("./index");

const Report = {
  // Generate weekly report for a user
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
  
  // Get weekly reports for a user
  getWeeklyReports: async (userId, limit) => {
    try {
      return await db.query(
        `SELECT ReportID, WeekStartDate, WeekEndDate, TotalEmission, 
                PreviousWeekEmission, EmissionChange, GeneratedAt
         FROM WeeklyReport
         WHERE UserID = ?
         ORDER BY WeekStartDate DESC
         LIMIT ?`,
        [userId, limit || 10]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get weekly report by ID
  getWeeklyReportById: async (reportId, userId) => {
    try {
      const reports = await db.query(
        `SELECT ReportID, UserID, WeekStartDate, WeekEndDate, TotalEmission, 
                PreviousWeekEmission, EmissionChange, GeneratedAt
         FROM WeeklyReport
         WHERE ReportID = ? AND UserID = ?`,
        [reportId, userId]
      );
      return reports.length ? reports[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Get weekly report details (emissions by category)
  getWeeklyReportDetails: async (userId, weekStartDate, weekEndDate) => {
    try {
      return await db.query(
        `SELECT c.CategoryName, SUM(e.EmissionValue) AS TotalEmission
         FROM EmissionLog e
         JOIN Activity a ON e.ActivityID = a.ActivityID
         JOIN Category c ON a.CategoryID = c.CategoryID
         WHERE e.UserID = ? AND DATE(e.Timestamp) BETWEEN ? AND ?
         GROUP BY c.CategoryID, c.CategoryName
         ORDER BY TotalEmission DESC`,
        [userId, weekStartDate, weekEndDate]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's carbon footprint trend
  getCarbonFootprintTrend: async (userId, period, startDate, endDate) => {
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
  
  // Get user's emissions by category
  getEmissionsByCategory: async (userId, startDate, endDate) => {
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
  
  // Get user's top emission activities
  getTopEmissionActivities: async (userId, limit) => {
    try {
      return await db.query(
        `SELECT ActivityType, CategoryName, TotalEmission, ActivityCount, AverageEmission
         FROM vw_UserTopEmissionActivities
         WHERE UserID = ?
         ORDER BY TotalEmission DESC
         LIMIT ?`,
        [userId, limit || 10]
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get community average emissions
  getCommunityAverageEmissions: async () => {
    try {
      return await db.query(
        `SELECT CategoryName, AverageEmission, UserCount
         FROM vw_CommunityAverageEmissions
         ORDER BY AverageEmission DESC`
      );
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's emission reduction progress
  getEmissionReductionProgress: async (userId, limit) => {
    try {
      return await db.query(
        `SELECT WeekStartDate, WeeklyEmission, PreviousWeekEmission, EmissionChangePercent
         FROM vw_UserEmissionReductionProgress
         WHERE UserID = ?
         ORDER BY WeekStartDate DESC
         LIMIT ?`,
        [userId, limit || 10]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Report;