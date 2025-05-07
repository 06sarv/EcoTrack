const { authJwt } = require("../middleware");
const controller = require("../controllers/emission.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new emission log
  app.post(
    "/api/emissions/log",
    [authJwt.verifyToken],
    controller.create
  );

  // Get all emission logs for a user
  app.get(
    "/api/emissions",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Get emissions summary for dashboard
  app.get(
    "/api/emissions/summary",
    [authJwt.verifyToken],
    controller.getSummary
  );

  // Get personalized recommendations
  app.get(
    "/api/emissions/recommendations",
    [authJwt.verifyToken],
    controller.getRecommendations
  );

  // Get emission log by id
  app.get(
    "/api/emissions/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Update emission log
  app.put(
    "/api/emissions/:id",
    [authJwt.verifyToken],
    controller.update
  );

  // Delete emission log
  app.delete(
    "/api/emissions/:id",
    [authJwt.verifyToken],
    controller.delete
  );
}; 