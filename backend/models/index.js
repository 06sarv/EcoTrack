const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.activity = require("./activity.model.js")(sequelize, Sequelize);
db.emissionLog = require("./emissionLog.model.js")(sequelize, Sequelize);
db.category = require("./category.model.js")(sequelize, Sequelize);

// Define relationships
db.user.hasMany(db.emissionLog, { foreignKey: 'UserID' });
db.emissionLog.belongsTo(db.user, { foreignKey: 'UserID' });

db.activity.hasMany(db.emissionLog, { foreignKey: 'ActivityID' });
db.emissionLog.belongsTo(db.activity, { foreignKey: 'ActivityID', as: 'activity' });

// Call associate functions
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;