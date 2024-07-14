/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      main: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'The review must belong to tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'The Review must belong to user'],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// query middleware for populating the reviews
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);

  // persisted to Tour
  await Tour.findByIdAndUpdate(tourId, {
    ratingAverage: stats[0].avgRating,
    ratingQuantity: stats[0].nRating,
  });
};

reviewSchema.post('save', function () {
  // this points to current reveiw
  this.constructor.calcAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
