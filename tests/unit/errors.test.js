const {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  InvalidStateError,
} = require('../../src/utils/errors');

describe('DomainError', () => {
  it('should set name and statusCode', () => {
    const err = new DomainError('boom', 418);

    expect(err.name).toBe('DomainError');
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe('boom');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('should default to 400', () => {
    const err = new ValidationError('bad input');

    expect(err.statusCode).toBe(400);
    expect(err.name).toBe('ValidationError');
  });
});

describe('NotFoundError', () => {
  it('should default to 404', () => {
    const err = new NotFoundError('missing');

    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('NotFoundError');
  });
});

describe('ConflictError', () => {
  it('should default to 409', () => {
    const err = new ConflictError('duplicate');

    expect(err.statusCode).toBe(409);
    expect(err.name).toBe('ConflictError');
  });
});

describe('InvalidStateError', () => {
  it('should default to 422', () => {
    const err = new InvalidStateError('bad transition');

    expect(err.statusCode).toBe(422);
    expect(err.name).toBe('InvalidStateError');
  });
});
