/* eslint-disable prettier/prettier */
module.exports = (fn) => (res, req, next) => {
  fn(res, req, next).catch((err) => next(err));
};
