/* eslint-disable prettier/prettier */
const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
//  MIDDLEWARE
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

// wrong urls handler
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`), 404);
});

// golbal middleware error handler
app.use(globalErrorHandler);

module.exports = app;
