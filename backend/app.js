const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const dashboardRoutes = require('./routes/dashboard');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.get('/', (req, res) => {
  res.send('EcoTrack API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 