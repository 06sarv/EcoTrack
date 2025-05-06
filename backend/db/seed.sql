INSERT INTO Category (CategoryName) VALUES ('Transportation'), ('Food'), ('Energy');

INSERT INTO Activity (ActivityType, CarbonEmissionRate, CategoryID, Unit, Description) VALUES
('Car', 0.21, 1, 'km', 'Personal car travel'),
('Bus', 0.05, 1, 'km', 'Public bus transportation'),
('Train', 0.04, 1, 'km', 'Train travel'),
('Plane', 0.25, 1, 'km', 'Air travel'),
('Bicycle', 0.00, 1, 'km', 'Bicycle travel (zero emissions)'),
('Walking', 0.00, 1, 'km', 'Walking (zero emissions)');

INSERT INTO Activity (ActivityType, CarbonEmissionRate, CategoryID, Unit, Description) VALUES
('Beef', 2.5, 2, 'meal', 'Beef-based meal'),
('Lamb', 2.4, 2, 'meal', 'Lamb-based meal'),
('Pork', 1.8, 2, 'meal', 'Pork-based meal'),
('Chicken', 1.2, 2, 'meal', 'Chicken-based meal'),
('Fish', 1.0, 2, 'meal', 'Fish-based meal'),
('Dairy', 0.8, 2, 'meal', 'Dairy-based meal'),
('Vegetables', 0.3, 2, 'meal', 'Vegetable-based meal'),
('Fruits', 0.2, 2, 'meal', 'Fruit-based meal'),
('Grains', 0.4, 2, 'meal', 'Grain-based meal');

INSERT INTO Activity (ActivityType, CarbonEmissionRate, CategoryID, Unit, Description) VALUES
('Electricity', 0.4, 3, 'kWh', 'Electricity consumption'),
('Natural Gas', 0.2, 3, 'kWh', 'Natural gas consumption'),
('Heating Oil', 0.3, 3, 'kWh', 'Heating oil consumption'),
('Propane', 0.25, 3, 'kWh', 'Propane consumption'),
('Wood', 0.1, 3, 'kWh', 'Wood burning'),
('Grid', 0.4, 3, 'kWh', 'Grid electricity consumption');

INSERT INTO Recommendations (CategoryID, Suggestion) VALUES
(1, 'Try carpooling or using public transport to reduce emissions.'),
(2, 'Incorporate more plant-based meals into your diet.'),
(3, 'Switch to energy-efficient appliances and turn off unused devices.'); 