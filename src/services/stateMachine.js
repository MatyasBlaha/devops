const { InvalidStateError } = require('../utils/errors');

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active: ['completed'],
  completed: [],
  cancelled: [],
};

function validateTransition(fromStatus, toStatus) {
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    throw new InvalidStateError(`cannot transition from ${fromStatus} to ${toStatus}`);
  }
}

module.exports = { validateTransition, ALLOWED_TRANSITIONS };
