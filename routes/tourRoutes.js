/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
// router.param('id', tourController.checkID);

// Nested routes
// POST tour/id/review (tour/kdkd83kdk9/reveiw)

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route(`/`)
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route(`/:id`)
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
