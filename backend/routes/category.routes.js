const { authJwt } = require("../middleware");
const controller = require("../controllers/category.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new category
  app.post(
    "/api/categories",
    [authJwt.verifyToken],
    controller.create
  );

  // Get all categories
  app.get(
    "/api/categories",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Get category by id
  app.get(
    "/api/categories/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Update category
  app.put(
    "/api/categories/:id",
    [authJwt.verifyToken],
    controller.update
  );

  // Delete category
  app.delete(
    "/api/categories/:id",
    [authJwt.verifyToken],
    controller.delete
  );
}; 