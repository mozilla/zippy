var crypto = require('crypto');
var Q = require('q');
var save = require('save');
var under = require('underscore');

var forms = require('./restforms');
var fields = forms.fields;
var trans = exports.trans = save('trans');


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/transactions/' + ob._id;
  delete ob._id;
  return ob;
}


function createToken() {
  // Create a token that cannot be guessed so it can be exposed on the query string.
  return Q.ninvoke(crypto, 'randomBytes', 64)
    .then(function(buf) {
      return buf.toString('hex');
    });
}


var transForm = forms.create({
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
      forms.validators.mustBeOneOf(['CARD', 'OPERATOR', 'INTERNET', 'PSMS'])
    ]
  }),
  product_id: fields.integer({
    required: true,
    validators: [forms.validators.isValidProduct({active: true})]
  }),
  region: fields.integer({
    required: true
  }),
  seller_id: fields.integer({
    required: true,
    validators: [forms.validators.isValidSeller({active: true})]
  }),
});


exports.post = function(req, res, next) {
  var ob = {};

  transForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);

      // These fields are auto-generated:
      ob.token = undefined;
      ob.status = 'started';
    })
    .then(function() {
      return createToken();
    })
    .then(function(token) {
      ob.token = token;
      // All is good. Create the transaction object.
      return Q.ninvoke(trans, 'create' , ob);
    })
    .then(function(ob) {
      res.send(201, serialize(ob));
    })
    .fail(function(err) {
      next(err);
    });
};
