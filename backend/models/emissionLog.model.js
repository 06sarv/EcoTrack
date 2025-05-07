module.exports = (sequelize, Sequelize) => {
  const EmissionLog = sequelize.define("EmissionLog", {
    LogID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'UserID'
      }
    },
    ActivityID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Activity',
        key: 'ActivityID'
      }
    },
    Timestamp: {
      type: Sequelize.DATE,
      allowNull: false
    },
    Quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    EmissionValue: {
      type: Sequelize.DECIMAL(8, 2)
    },
    Notes: {
      type: Sequelize.TEXT
    },
    TransportationType: {
      type: Sequelize.STRING(50)
    },
    NumPassengers: {
      type: Sequelize.INTEGER
    },
    MealType: {
      type: Sequelize.STRING(50)
    },
    FoodSource: {
      type: Sequelize.STRING(50)
    },
    EnergySource: {
      type: Sequelize.STRING(50)
    }
  }, {
    tableName: 'EmissionLog',
    timestamps: false
  });

  return EmissionLog;
}; 