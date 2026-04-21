const { ValidationError } = require('./errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('email format is invalid');
  }
}

function validateDateNotInFuture(date, fieldName) {
  if (new Date(date) > new Date()) {
    throw new ValidationError(`${fieldName} cannot be in the future`);
  }
}

function validateLicenseAge(licenseDate, minYears) {
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - minYears);
  if (new Date(licenseDate) > limit) {
    throw new ValidationError(`drivers license must be held for at least ${minYears} year`);
  }
}

module.exports = { validateEmail, validateDateNotInFuture, validateLicenseAge };
