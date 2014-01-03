'use strict';

var Q = require('q');
var querystring = require('querystring');
var restify = require('restify');
var under = require('underscore');

var products = require('./products');
var sellers = require('./sellers');
var forms = require('./restforms');
var trans = require('./trans');

var errors = restify.errors;
var fields = forms.fields;


exports.confirmPayment = function (req, res, next, context) {
  context = under.extend(context || {}, {
    title: req.gettext('Confirm Payment'),
  });
  var body = res.render('confirm.html', context);
  res.send(body);
  next();
};


exports.creditCard = function (req, res, next, context) {
  context = under.extend(context || {}, {
    title: req.gettext('Pay by Card'),
  });
  var body = res.render('credit-card.html', context);
  res.send(body);
  next();
};


exports.processPayment = function (req, res, next) {
  Q.promise(function(resolve) {
      if (!req.zippySession.transactionId) {
        throw new restify.ConflictError(
                    'Cannot process payment; no transactionId in session');
      }
      resolve(req.zippySession.transactionId);
    })
    .then(function(activeTransId) {
      console.log('updating transaction', activeTransId);
      var defer = Q.defer();

      trans.models.update({
        _id: activeTransId,
        status: 'PROCESSED',
      }, false, function(err, activeTrans) {
        if (err) {
          return defer.reject(err);
        }
        defer.resolve(activeTrans);
      });

      return defer.promise;
    })
    .then(function(activeTrans) {
      console.log('ok, updated trans', activeTrans);
      var notice = {
        ext_transaction_id: activeTrans.ext_transaction_id,
      };

      // In a real life app you might want to sanitize this URL
      // to protect against header location attacks. All input to create
      // this URL is submitted after Oauth authentication though so it
      // would just be a defense-in-depth thing here.
      res.header('Location',
                 activeTrans.success_url + '?' + querystring.stringify(notice));
      res.send(301);
      next();
    })
    .fail(function(err) {
      console.log('Error', err);  // fixme: bug 938352
      next(err);
    });
};


var purchaseForm = forms.create({
  // This is the transaction token.
  tx: fields.string({
    required: true,
  }),
});


exports.start = function (req, res, next) {
  var activeTrans;
  var product;
  var seller;

  // We will start a new transaction after validating the form.
  req.zippySession.transactionId = null;

  purchaseForm.promise(req)
    .then(function(data) {
      return Q.ninvoke(trans.models, 'findOne', {token: data.tx});
    })
    .then(function(_trans) {
      if (!_trans) {
        throw new errors.NotFoundError('transaction not found');
      }
      activeTrans = _trans;
      if (activeTrans.status !== 'STARTED') {
        console.log('Attempt to start trans ' + activeTrans.token + ' ' +
                    'with status=' + activeTrans.status);
        throw new errors.BadRequestError('transaction cannot be started');
      }
    })
    .then(function() {
      return Q.ninvoke(products.models, 'findOne', {_id: activeTrans.product_id});
    })
    .then(function(_product) {
      if (!_product) {
        throw new Error('Zero matching products for product_id ' +
                        activeTrans.product_id);
      }
      product = _product;
    })
    .then(function() {
      return Q.ninvoke(sellers.models, 'findOne', {_id: product.seller_id});
    })
    .then(function(_seller) {
      if (!_seller) {
        throw new Error('Zero matching sellers for id ' +
                        product._id);
      }
      seller = _seller;
    })
    .then(function() {

      req.zippySession.transactionId = activeTrans._id;

      // todo: choose which render func based on payment method.
      var context = {
        trans: activeTrans,
        product: product,
        seller: seller,
        processUrl: '/payment/process',
      };

      var view;
      switch (activeTrans.pay_method) {
      case 'OPERATOR':
        view = exports.confirmPayment;
        break;
      case 'CARD':
        view = exports.creditCard;
        break;
      default:
        throw new Error('Not sure what to render for pay_method ' +
                        activeTrans.pay_method);
      }
      return view(req, res, next, context);
    })
    .fail(function(err) {
      console.log('Error', err);  // fixme: bug 938352
      next(err);
    });
};
