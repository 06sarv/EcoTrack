-- Drop the view if it exists
DROP VIEW IF EXISTS WeeklyEmissionSummary;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS AfterEmissionLogInsert;

-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS GetUserRecommendations;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS EmissionAudit;
DROP TABLE IF EXISTS EmissionLog;
DROP TABLE IF EXISTS Recommendations;
DROP TABLE IF EXISTS Activity;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS User; 