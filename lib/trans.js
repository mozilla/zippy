var crypto = require('crypto');
var under = require('underscore');
var uuid = require('node-uuid');
var nodefn = require('when/node/function');

var forms = require('./restforms');
var fields = forms.fields;
var redisClient = require('./redisclient');
var z = require('./zutil');


function createToken() {
  // Create a token that cannot be guessed so it can be exposed on the query string.
  var stringifyHexBuffer = function(buf) {
    return buf.toString('hex');
  };
  return nodefn.call(crypto.randomBytes, 64).then(stringifyHexBuffer);
}


var transForm = forms.create({
  /*jshint camelcase: false */
  carrier: fields.string({
    required: true
  }),
  // TODO(Kumar): figure out if it's ok to let WebPay *always* dictate
  // price/currency/method. This means that the payment provider could
  // not make a decision to e.g. abort operator billing and fall back to
  // credit card.
  currency: fields.string({
    required: true,
    validators: [
      forms.validators.mustBeOneOf([
        'AUD',
        'CAD',
        'CHF',
        'COP',
        'DKK',
        'EGP',
        'EUR',
        'GBP',
        'HUF',
        'IDR',
        'MXN',
        'MYR',
        'NOK',
        'NZD',
        'PHP',
        'PLN',
        'QAR',
        'SEK',
        'SGD',
        'THB',
        'USD',
        'ZAR',
      ])
    ]
  }),
  price: fields.money({
    required: true
  }),
  pay_method: fields.string({
    required: true,
    validators: [
      forms.validators.mustBeOneOf(['CARD', 'OPERATOR'])
    ]
  }),
  product_id: fields.string({
    required: true,
    validators: [forms.validators.isValidProduct({status: 'ACTIVE'})]
  }),
  region: fields.string({
    required: true
  }),
  callback_success_url: fields.url({
    required: true
  }),
  callback_error_url: fields.url({
    required: true
  }),
  success_url: fields.url({
    required: true
  }),
  error_url: fields.url({
    required: true
  }),
  ext_transaction_id: fields.string({
    required: true
  }),
});


exports.create = function(req, res, next) {
  var transaction = {};

  transForm.promise(req)
    .then(function extendData(data) {
      // These fields are auto-generated:
      transaction.token = undefined;
      transaction.status = 'STARTED';
      transaction.uuid = uuid.v4();
      return under.extend(transaction, data);
    })
    .then(function generateToken() {
      return createToken();
    })
    .then(function createTransaction(token) {
      transaction.token = token;
      return redisClient.hmset('transaction-' + transaction.uuid, transaction);
    })
    .then(function serializeTransaction() {
      res.send(201, z.serialize(transaction, 'transactions'));
    })
    .catch(z.handleError(next));
};
