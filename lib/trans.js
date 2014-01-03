var crypto = require('crypto');
var Q = require('q');
var request = require('request');
var save = require('save');
var under = require('underscore');

var forms = require('./restforms');
var fields = forms.fields;
var models = exports.models = save('trans');
var notices = require('./notices');
var z = require('./zutil');


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
  var ob = req.params;

  transForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);

      // These fields are auto-generated:
      ob.token = undefined;
      ob.status = 'STARTED';
    })
    .then(function() {
      return createToken();
    })
    .then(function(token) {
      ob.token = token;
      // All is good. Create the transaction object.
      return Q.ninvoke(models, 'create' , ob);
    })
    .then(function(transaction) {
      res.send(201, z.serialize(transaction, 'transactions'));
      next();
      return transaction;
    })
    .then(function(transaction) {
      notices.signedQs(transaction)
        .then(function(signed_notice) {
          request.post(transaction.callback_success_url + '?' + signed_notice,
            function (error, response, body) {
              if (error || response.statusCode !== 200) {
                // In case of a real implementation, you should queue, retry and
                // notify the developer on ultimate failure.
                console.log('Postback against ' + transaction.callback_success_url + ' failed: ' + error + ' ' + body);
              } else {
                console.log('Postback against ' + transaction.callback_success_url + ' succeed: ' + body);
              }
            });
        });
    })
    .fail(function(err) {
      notices.signedQs(ob)
        .then(function(signed_notice) {
          request.post(ob.callback_error_url + '?' + signed_notice,
            function (error, response, body) {
              if (error || response.statusCode !== 200) {
                // In case of a real implementation, you should queue, retry and
                // notify the developer on ultimate failure.
                console.log('Postback against ' + ob.callback_error_url + ' failed: ' + error + ' ' + body);
              } else {
                console.log('Postback against ' + ob.callback_error_url + ' succeed: ' + body);
              }
            });
        });
      next(err);
    });
};
