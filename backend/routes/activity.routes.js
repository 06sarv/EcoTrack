const { authJwt } = require("../middleware");
const controller = require("../controllers/activity.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new activity
  app.post(
    "/api/activities",
    [authJwt.verifyToken],
    controller.create
  );

  // Get all activities
  app.get(
    "/api/activities",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Get activity by id
  app.get(
    "/api/activities/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Update activity
  app.put(
    "/api/activities/:id",
    [authJwt.verifyToken],
    controller.update
  );

  // Delete activity
  app.delete(
    "/api/activities/:id",
    [authJwt.verifyToken],
    controller.delete
  );
}; 