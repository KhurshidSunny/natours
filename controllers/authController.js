/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//  LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exit
  if (!email || !password)
    return next(new AppError('please enter the email and password'), 400);

  // 2. Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect password or email', 401));

  // 3. if Everything ok, send the client a token
  const token = signToken(user._id);
  res.status(400).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. checking token and see if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('you are not logged in! Please log in to get access', 401),
    );
  }

  // 2. verification token

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

  // 3. Check if the user exist
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist', 401),
    );
  }

  // 4. check if the user changed the password
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(
        'user recently changed the password! Please log in again',
        401,
      ),
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'you do not have the permission to perform this action',
          403,
        ),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. GET USER BASED ON THE POSTed EMAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email address', 404));
  }

  // 2: GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. SEND IT TO THE USER'S EMAIL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to the ${resetUrl}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token, (valid for 10 mins)`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token send to the email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(
      new AppError(
        'There was an error sending the mail. please try again later!',
        500,
      ),
    );
    console.log(err);
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. IF THE TOKEN HAS NOT EXPIRED, AND THERE IS USER. SET THE PASSWORD
  if (!user) {
    return next(new AppError('Token has expired or invalid', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. UPDATE changedPasswordAt PROPERTY FOR THE USER

  // 4. LOG THE USER IN, SEND JWT
  const token = signToken(user._id);
  res.status(400).json({
    status: 'success',
    token,
  });
});
