const db = require("../models");
const Activity = db.activity;
const Category = db.category;
const { Op } = require("sequelize");

// Create and Save a new Activity
exports.create = (req, res) => {
  // Validate request
  if (!req.body.ActivityType) {
    res.status(400).send({
      message: "Activity type can not be empty!"
    });
    return;
  }

  // Create an Activity
  const activity = {
    ActivityType: req.body.ActivityType,
    CarbonEmissionRate: req.body.CarbonEmissionRate,
    CategoryID: req.body.CategoryID,
    Unit: req.body.Unit,
    Description: req.body.Description
  };

  // Save Activity in the database
  Activity.create(activity)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Activity."
      });
    });
};

// Retrieve all Activities
exports.findAll = (req, res) => {
  Activity.findAll({
    include: [{
      model: Category,
      as: 'category',
      attributes: ['CategoryName']
    }],
    attributes: ['ActivityID', 'ActivityType', 'CarbonEmissionRate', 'Unit', 'Description']
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error("Error fetching activities:", err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving activities."
      });
    });
};

// Find a single Activity with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Activity.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Activity with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Activity with id=" + id
      });
    });
};

// Update an Activity
exports.update = (req, res) => {
  const id = req.params.id;

  Activity.update(req.body, {
    where: { ActivityID: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Activity was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Activity with id=${id}. Maybe Activity was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Activity with id=" + id
      });
    });
};

// Delete an Activity
exports.delete = (req, res) => {
  const id = req.params.id;

  Activity.destroy({
    where: { ActivityID: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Activity was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Activity with id=${id}. Maybe Activity was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Activity with id=" + id
      });
    });
}; 