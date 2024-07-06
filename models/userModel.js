/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');

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
    },
    message: 'The password does not match',
  },
});

// MODEL

const User = mongoose.model('User', userSchema);

module.exports = User;
