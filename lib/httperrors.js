/*
 * Extend errors module with restify-like errors
 * With these mapped they can be thrown from the errors namespace.
 *
 * e.g:
 *
 *   var errors = require('error');
 *   throw new errors.InvalidArgumentError('Blah should have been provided')
 *
 */

var errors = require('errors');


var mapping = {
  'Http400Error': [
    'BadDigestError',
    'BadRequestError',
    'InvalidContentError',
    'InvalidHeaderError',
    'InvalidVersionError',
    'RequestExpiredError',
  ],
  'Http401Error': [
    'InvalidCredentialsError',
  ],
  'Http403Error': [
    'NotAuthorizedError',
  ],
  'Http404Error': [
    'NotFoundError',
    'ResourceNotFoundError',
  ],
  'Http405Error': [
    'BadMethodError',
  ],
  'Http409Error': [
    'ConflictError',
    'InvalidArgumentError',
    'MissingParameterError',
  ],
  'Http412Error': [
    'PreconditionFailedError',
  ],
  'Http429Error': [
    'RequestThrottledError',
  ],
  'Http406Error': [
    'WrongAcceptError',
  ],
  'Http500Error': [
    'InternalError',
  ],
};



// We don't use the mapping functionality here so that we can use
// these errors directly without needing `errors.mapError`.
Object.keys(mapping).forEach(function(key) {
  var errorNames = mapping[key];
  for (var i=0, j=errorNames.length; i<j; i++) {
    var errorName = errorNames[i];
    // Grab the status code from the error name.
    var statusCodeMatch = key.match(/[0-9]{3}/);
    var statusCode = statusCodeMatch ? statusCodeMatch[0] : statusCodeMatch;
    errors.create({
      name: errorName,
      parent: errors[key],
      code: parseInt(statusCode, 10),
    });
  }
});
