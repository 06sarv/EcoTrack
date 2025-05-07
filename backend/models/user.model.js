const db = require("./index");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    UserID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    Email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    Password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    Location: {
      type: Sequelize.STRING(100)
    },
    RegistrationDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'User',
    timestamps: false
  });

  return User;
};