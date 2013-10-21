var crypto = require('crypto');
var Q = require('q');
var restify = require('restify');
var save = require('save');

var zutil = require('./zutil');

var trans = exports.trans = save('trans');
var sellers = require('./sellers').sellers;  // from save()
var products = require('./products').products;  // from save()


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


exports.post = function(req, res, next) {
  var ob = {};

  zutil.requireParams(req,
                      {seller_id: 'seller_id is required',
                       product_id: 'product_id is required',
                       region: 'region is required',
                       carrier: 'carrier is required',
                       price: 'price is required',
                       currency: 'currency is required',
                       pay_method: 'pay_method is required'})
    .then(function() {
      ob = {
        seller_id: req.params.seller_id,
        product_id: req.params.product_id,

        // TODO(Kumar): validate all the values for these fields. bug 929072.
        region: req.params.region,
        carrier: req.params.carrier,
        price: req.params.price,
        currency: req.params.currency,
        pay_method: req.params.pay_method,

        // TODO(Kumar): figure out if it's ok to let WebPay *always* dictate
        // price/currency/method. This means that the payment provider could
        // not make a decision to e.g. abort operator billing and fall back to
        // credit card.

        // These fields are auto-generated:
        token: undefined,
        status: 'started'
      };
    })
    .then(function() {
      return Q.ninvoke(sellers, 'findOne', {_id: ob.seller_id, active: true});
    })
    .then(function(seller) {
      if (!seller) {
        throw new restify.ResourceNotFoundError(
                        'seller_id ' + ob.seller_id + ' not found or inactive');
      }
    })
    .then(function() {
      return Q.ninvoke(products, 'findOne', {_id: ob.product_id, active: true});
    })
    .then(function(product) {
      if (!product) {
        throw new restify.ResourceNotFoundError(
                'product_id ' + ob.product_id + ' not found or inactive');
      }
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
