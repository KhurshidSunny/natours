/* eslint-disable prettier/prettier */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const BookingModel = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

/* eslint-disable prettier/prettier */
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1: Get the currenlty booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2: Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slag}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',

          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  // 3: create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE, because everyone can book a tour without paying for it
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await BookingModel.create({ tour, user, price });

  // redirect to home page
  res.redirect(req.originalUrl.split('?')[0]);
});
