const db = require("../models");
const EmissionLog = db.emissionLog;
const Activity = db.activity;
const Category = db.category;
const { Op } = require("sequelize");

// Create and Save a new Emission Log
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.activityId || !req.body.quantity) {
    res.status(400).send({
      message: "Activity and quantity can not be empty!"
    });
    return;
  }

  // Fetch the activity to get its CarbonEmissionRate and category
  const activity = await Activity.findByPk(req.body.activityId, { include: [{ model: Category, as: 'category' }] });
  if (!activity) {
    return res.status(400).send({ message: "Invalid activity ID" });
  }
  let emissionValue = req.body.quantity * activity.CarbonEmissionRate;

  // Adjust for category-specific logic
  const category = activity.category?.CategoryName;
  if (category === 'Transportation') {
    const numPassengers = parseInt(req.body.numPassengers) || 1;
    emissionValue = emissionValue / numPassengers;
  } else if (category === 'Food') {
    // Meal type multipliers
    const mealTypeMultipliers = {
      Breakfast: 0.8,
      Lunch: 1.0,
      Dinner: 1.2,
      Snack: 0.7
    };
    const mealType = req.body.mealType;
    const multiplier = mealTypeMultipliers[mealType] || 1.0;
    emissionValue = emissionValue * multiplier;
  } else if (category === 'Energy') {
    // Energy source multipliers
    const energySourceMultipliers = {
      Grid: 1.0,
      Solar: 0.1,
      Wind: 0.05,
      Nuclear: 0.2,
      Hydro: 0.15,
      'Fossil Fuels': 1.5
    };
    const energySource = req.body.energySource;
    const multiplier = energySourceMultipliers[energySource] || 1.0;
    emissionValue = emissionValue * multiplier;
  }

  // Create an Emission Log
  const emissionLog = {
    UserID: req.userId,
    ActivityID: req.body.activityId,
    Quantity: req.body.quantity,
    EmissionValue: emissionValue,
    Timestamp: req.body.date || new Date(),
    Notes: req.body.notes,
    TransportationType: req.body.transportationType || null,
    NumPassengers: req.body.numPassengers || null,
    MealType: req.body.mealType || null,
    FoodSource: req.body.foodSource || null,
    EnergySource: req.body.energySource || null
  };

  console.log('Creating emission log:', emissionLog);

  // Save Emission Log in the database
  EmissionLog.create(emissionLog)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Emission Log."
      });
    });
};

// Retrieve all Emission Logs for a user
exports.findAll = (req, res) => {
  const userId = req.userId;
  const { startDate, endDate } = req.query;

  const whereClause = {
    UserID: userId
  };

  if (startDate && endDate) {
    whereClause.Timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  EmissionLog.findAll({
    where: whereClause,
    include: [
      {
        model: Activity,
        as: 'activity',
        include: [
          {
            model: Category,
            as: 'category'
          }
        ]
      }
    ],
    order: [['Timestamp', 'DESC']],
    raw: true,
    subQuery: false,
    distinct: true
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving emission logs."
      });
    });
};

// Find a single Emission Log with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  EmissionLog.findOne({
    where: { 
      LogID: id,
      UserID: userId
    },
    include: [
      {
        model: Activity,
        as: 'activity',
        include: [
          {
            model: Category,
            as: 'category'
          }
        ]
      }
    ],
    raw: true,
    subQuery: false,
    distinct: true
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Emission Log with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Emission Log with id=" + id
      });
    });
};

// Update an Emission Log
exports.update = (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  EmissionLog.update(req.body, {
    where: { 
      LogID: id,
      UserID: userId
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Emission Log was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Emission Log with id=${id}. Maybe Emission Log was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Emission Log with id=" + id
      });
    });
};

// Delete an Emission Log
exports.delete = (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  EmissionLog.destroy({
    where: { 
      LogID: id,
      UserID: userId
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Emission Log was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Emission Log with id=${id}. Maybe Emission Log was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Emission Log with id=" + id
      });
    });
};

// Get emissions summary for dashboard
exports.getSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get emissions by category
    const emissionsByCategory = await EmissionLog.findAll({
      where: {
        UserID: userId,
        Timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [db.sequelize.col('activity.category.CategoryName'), 'CategoryName'],
        [db.sequelize.fn('SUM', db.sequelize.col('EmissionValue')), 'total']
      ],
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: []
            }
          ]
        }
      ],
      group: ['activity.category.CategoryID', 'activity.category.CategoryName'],
      order: [[db.sequelize.fn('SUM', db.sequelize.col('EmissionValue')), 'DESC']],
      raw: true
    });

    // Get emissions over time
    const emissionsOverTimeRaw = await EmissionLog.findAll({
      where: {
        UserID: userId,
        Timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('Timestamp')), 'date'],
        [db.sequelize.fn('SUM', db.sequelize.col('EmissionValue')), 'total']
      ],
      group: [db.sequelize.fn('DATE', db.sequelize.col('Timestamp'))],
      order: [[db.sequelize.fn('DATE', db.sequelize.col('Timestamp')), 'ASC']],
      raw: true
    });

    // Only return days with logged emissions
    const emissionsOverTime = emissionsOverTimeRaw.map(e => ({
      date: e.date,
      total: parseFloat(e.total)
    }));

    // Calculate weekly emissions (already for selected range)
    const weeklyEmissions = emissionsOverTime.reduce((sum, day) => sum + parseFloat(day.total), 0);

    // Calculate monthly average
    const monthlyAverage = weeklyEmissions * 4; // Simple approximation

    // Calculate CO2 saved (example calculation)
    let co2Saved = weeklyEmissions * 0.1; // Assuming 10% reduction
    co2Saved = Math.round(co2Saved * 10000) / 10000;

    res.json({
      emissionsByCategory,
      emissionsOverTime,
      weeklyEmissions,
      monthlyAverage,
      co2Saved
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving emissions summary"
    });
  }
};

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const days = 30; // Look at last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's highest emission categories
    const userEmissions = await EmissionLog.findAll({
      where: {
        UserID: userId,
        Timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [],
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['ActivityType'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['CategoryName']
            }
          ]
        }
      ],
      group: ['activity.category.CategoryID', 'activity.ActivityType', 'activity.ActivityID'],
      order: [[db.sequelize.fn('SUM', db.sequelize.col('EmissionValue')), 'DESC']],
      raw: true,
      subQuery: false,
      distinct: true
    });

    // Generate recommendations based on highest emission categories (one per unique category)
    const seenCategories = new Set();
    const recommendations = [];
    userEmissions.forEach(emission => {
      const category = emission['activity.category.CategoryName'];
      if (!category || seenCategories.has(category)) return;
      seenCategories.add(category);

      let suggestion = '';
      switch (category) {
        case 'Transportation':
          suggestion = 'Consider using public transport or carpooling for your daily commute.';
          break;
        case 'Food':
          suggestion = 'Try incorporating more plant-based meals into your diet.';
          break;
        case 'Energy':
          suggestion = 'Turn off lights and appliances when not in use, and consider using energy-efficient devices.';
          break;
        default:
          suggestion = 'Look for ways to reduce your consumption in this category.';
      }
      recommendations.push({
        CategoryName: category,
        Suggestion: suggestion
      });
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving recommendations"
    });
  }
}; 