/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide you name'],
    unique: true,
  },

  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  photo: String,

  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'The passwords are not same',
    },
  },
});

// encrypt the password (middleware)
userSchema.pre('save', async function (next) {
  // if the password is not modified to prevent an already hashed password each time the doc is saved to the DB
  if (!this.isModified('password')) return next();

  // if the password is modified or being set for the first time
  this.password = await bcrypt.hash(this.password, 12);

  //
  this.confirmPassword = undefined;
  next();
});

// MODEL

const User = mongoose.model('User', userSchema);

module.exports = User;