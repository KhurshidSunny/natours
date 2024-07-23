/* eslint-disable prettier/prettier */
/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */

const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const { name: value } = err.keyValue;
  const message = `Duplicate field value: "${value}". please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  console.log(err);
  return new AppError('invalid token. Please login again', 401);
};

const sendErrorDev = (err, req, res) => {
  // a) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // b) RENDERED WEBSITE
  console.log('Error ', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // a) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational: trusted Error: send message to client
    if (err.isOperational) {
      console.log(err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log('Error ', err);

    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // b) RENDERED WEBSITE
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  console.log('Error ', err);

  // send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err?.name === 'CastError') err = handleCastErrorDB(err);
    if (err?.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err?.errors?.name?.name === 'ValidatorError')
      err = handleValidationErrorDB(err);

    if (err.name) err = handleJWTError(err);

    sendErrorProd(err, req, res);
  }
};
