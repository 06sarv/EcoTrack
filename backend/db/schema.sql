-- User Table
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Location VARCHAR(100),
    RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Category Table
CREATE TABLE Category (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL
);

-- Activity Table
CREATE TABLE Activity (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    ActivityType VARCHAR(100) NOT NULL,
    CarbonEmissionRate DECIMAL(6,2) NOT NULL CHECK (CarbonEmissionRate >= 0),
    CategoryID INT,
    Unit VARCHAR(20) NOT NULL,
    Description TEXT,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- EmissionLog Table
CREATE TABLE EmissionLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    ActivityID INT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Quantity DECIMAL(10,2) NOT NULL,
    EmissionValue DECIMAL(8,2) NOT NULL CHECK (EmissionValue >= 0),
    Notes TEXT,
    -- New columns for additional activity details
    TransportationType VARCHAR(50),
    NumPassengers INT,
    MealType VARCHAR(50),
    FoodSource VARCHAR(50),
    EnergySource VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (ActivityID) REFERENCES Activity(ActivityID)
);

-- Recommendations Table
CREATE TABLE Recommendations (
    RecID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryID INT,
    Suggestion TEXT NOT NULL,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- EmissionAudit Table (for trigger demo)
CREATE TABLE EmissionAudit (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    LogID INT,
    Action VARCHAR(20),
    ActionTime DATETIME
);

-- View: Weekly Emission Summary
CREATE VIEW WeeklyEmissionSummary AS
SELECT 
    u.UserID, u.Name, 
    WEEK(e.Timestamp) AS WeekNum,
    SUM(e.EmissionValue) AS TotalEmissions
FROM User u
JOIN EmissionLog e ON u.UserID = e.UserID
GROUP BY u.UserID, WeekNum;

-- Trigger: After EmissionLog Insert
DELIMITER $$
CREATE TRIGGER AfterEmissionLogInsert
AFTER INSERT ON EmissionLog
FOR EACH ROW
BEGIN
    INSERT INTO EmissionAudit (UserID, LogID, Action, ActionTime)
    VALUES (NEW.UserID, NEW.LogID, 'INSERT', NOW());
END$$
DELIMITER ;

-- Cursor: Get User Recommendations
DELIMITER $$
CREATE PROCEDURE GetUserRecommendations(IN uid INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE catid INT;
    DECLARE rec TEXT;
    DECLARE cur CURSOR FOR 
        SELECT DISTINCT a.CategoryID 
        FROM EmissionLog e
        JOIN Activity a ON e.ActivityID = a.ActivityID
        WHERE e.UserID = uid;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO catid;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT Suggestion INTO rec FROM Recommendations WHERE CategoryID = catid LIMIT 1;
        SELECT rec AS Recommendation;
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ; 