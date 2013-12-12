'use strict';

var Q = require('q');
var querystring = require('querystring');
var under = require('underscore');

var products = require('./products');
var sellers = require('./sellers');
var forms = require('./restforms');
var trans = require('./trans');

var fields = forms.fields;
var trans = require('./trans');

var errors = require('./errors');


exports.confirmPayment = function (req, res) {
  var context = under.extend(context || {}, {
    title: req.gettext('Confirm Payment'),
  });
  res.render('confirm.html', context);
};


exports.creditCard = function (req, res) {
  var context = {
    title: req.gettext('Pay by Card'),
  };
  res.render('credit-card.html', context);
};


var processPaymentForm = forms.create({
  simulate_fail: fields.string({
    required: false,
    validators: [
      forms.validators.mustBeOneOf([
        'CC_ERROR',  // credit card
        'DIR_BILL_ERROR',  // direct billing
      ]),
    ],
  }),
});


exports.processPayment = function (req, res, next) {
  var data;

  processPaymentForm.promise(req)
    .then(function(_data) {
      data = _data;
    })
    .then(function() {
      if (!req.zippySession.transactionId) {
        throw new errors.ConflictError(
                    'Cannot process payment; no transactionId in session');
      }
      return req.zippySession.transactionId;
    })
    .then(function(activeTransId) {
      console.log('updating transaction', activeTransId);
      var defer = Q.defer();
      var status;


      // NOTE:
      // This is where you'd actually process a transaction by
      // submitting credit card details to a gateway and/or putting
      // charges directly on an operator bill.

      if (data.simulate_fail) {
        console.log('Simulating a failure:', data.simulate_fail);
        status = 'FAILED';
      } else {
        console.log('Simulating a successful transaction');
        status = 'COMPLETED';
      }

      trans.models.update({
        _id: activeTransId,
        status: status,
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
      var location;

      if (activeTrans.status === 'COMPLETED') {
        location = activeTrans.success_url;
      } else {
        location = activeTrans.error_url;
        notice.error = data.simulate_fail;
      }
      console.log('Redirecting user (for trans',
                  activeTrans._id, ') to', location);

      // In a real life app you might want to sanitize this URL
      // to protect against header location attacks. All input to create
      // this URL is submitted after Oauth authentication though so it
      // would just be a defense-in-depth thing here.
      res.header('Location', location + '?' + querystring.stringify(notice));
      res.send(301);
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
