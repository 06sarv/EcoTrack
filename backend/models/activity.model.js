module.exports = (sequelize, Sequelize) => {
  const Activity = sequelize.define("Activity", {
    ActivityID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ActivityType: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    CarbonEmissionRate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    CategoryID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Category',
        key: 'CategoryID'
      }
    },
    Unit: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    Description: {
      type: Sequelize.TEXT
    }
  }, {
    tableName: 'Activity',
    timestamps: false
  });

  Activity.associate = function(models) {
    Activity.belongsTo(models.category, {
      foreignKey: 'CategoryID',
      as: 'category'
    });
  };

  return Activity;
};