/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

// SETTING UP VIEW ENGINE
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1.  GLOBAL MIDDLEWARE

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// BODY PARSER ,READING DATA FROM THE BODY NOT req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUEST FROM THE SAME API
const rateLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', rateLimiter);

// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  // console.log(req.cookies);

  next();
});

// ROUTES

app.use(`/`, viewRouter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);
app.use(`/api/v1/bookings`, bookingRouter);

// wrong urls handler
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`), 404);
});

// Data sanitization against NOSql injection
app.use(mongoSanitize());

// Data sanitization against XSS (adding any html or js code to the req)
app.use(xss());

// prevent paramters pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// compression the response text
app.use(compression());

// golbal middleware error handler
app.use(globalErrorHandler);

module.exports = app;
