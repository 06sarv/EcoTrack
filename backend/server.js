const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS
app.use(cors());

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = require("./models");

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to EcoTrack Carbon Footprint Calculator API." });
});

// Routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/activity.routes")(app);
require("./routes/emission.routes")(app);
require("./routes/category.routes")(app);
require("./routes/recommendation.routes")(app);
require("./routes/report.routes")(app);
require("./routes/goal.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});