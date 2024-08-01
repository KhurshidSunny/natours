/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },

  price: {
    type: Number,
    required: [true, 'Booking must a have price'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  paid: {
    type: Boolean,
    default: true,
  },
});

// populating the user and tour
BookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

const BookingModel = mongoose.model('Booking', BookingSchema);

module.exports = BookingModel;
