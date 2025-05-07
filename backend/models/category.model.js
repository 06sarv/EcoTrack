module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define("Category", {
    CategoryID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CategoryName: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Category',
    timestamps: false
  });

  return Category;
};