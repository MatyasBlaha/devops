class DomainError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message, 404);
  }
}

class ConflictError extends DomainError {
  constructor(message) {
    super(message, 409);
  }
}

class InvalidStateError extends DomainError {
  constructor(message) {
    super(message, 422);
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  InvalidStateError,
};
