var errors = require('errors');
var request = require('request');
var under = require('underscore');
var when = require('when');

var config = require('./config');
var forms = require('./restforms');
var notices = require('./notices');
var redisClient = require('./redisclient');
var z = require('./zutil');

var fields = forms.fields;

exports.confirmPayment = function(req, res) {
  var context = under.extend(res.locals.context || {}, {
    title: req.gettext('Confirm Payment'),
  });
  res.render('confirm-payment.html', context);
};


exports.creditCard = function(req, res) {
  var context = under.extend(res.locals.context || {}, {
    title: req.gettext('Pay by Card'),
  });
  res.render('credit-card.html', context);
};


exports.mtAuth = function (req, res) {
  var context = under.extend(res.locals.context || {}, {
    title: req.gettext('Confirm your Mobile Number')
  });
  res.render('mt-auth.html', context);
};


exports.confirmSMSPin = function (req, res) {
  var context = under.extend(res.locals.context || {}, {
    title: req.gettext('Confirm your Mobile Number')
  });
  res.render('confirm-sms-pin.html', context);
};


var processPaymentForm = forms.create({
  /*jshint camelcase: false */
  simulate_fail: fields.string({
    required: false,
    validators: [
      forms.validators.mustBeOneOf([
        'CC_ERROR',  // credit card
        'DIR_BILL_ERROR',  // direct billing
      ]),
    ],
  }),
}, {
  validatePastFirstError: true,
});


exports.processPayment = function(req, res, next) {
  console.log('processPayment');
  var data;
  var postbackUrl;
  var redirectUrl;
  var activeTrans = {};


  processPaymentForm.promise(req)
    .then(function storeData(_data) {
      data = _data;
    })
    .then(function retrieveTransactionId() {
      if (!req.zippySession.transactionId) {
        throw new errors.ConflictError(
                  'Cannot process payment; no transactionId in session');
      }
      return req.zippySession.transactionId;
    })
    .then(function retrieveTransaction(activeTransId) {
      console.log('updating transaction', activeTransId);
      return redisClient.hgetall('transaction-' + activeTransId);
    })
    .then(function processTransaction(transaction) {

      // NOTE:
      // This is where you'd actually process a transaction by
      // submitting credit card details to a gateway and/or putting
      // charges directly on an operator bill.

      if (data.simulate_fail) {
        console.log('Simulating a failure:', data.simulate_fail);
        transaction.status = 'FAILED';
      } else {
        console.log('Simulating a successful transaction');
        transaction.status = 'COMPLETED';
      }
      activeTrans = transaction;
      return transaction;
    })
    .then(function updateTransaction(transaction) {
      return redisClient.hmset('transaction-' + transaction.uuid, transaction);
    })
    .then(function generateNotice() {
      console.log('ok, updated trans', activeTrans);
      var notice = {
        ext_transaction_id: activeTrans.ext_transaction_id,
      };

      if (activeTrans.status === 'COMPLETED') {
        redirectUrl = activeTrans.success_url;
        postbackUrl = activeTrans.callback_success_url;
      } else {
        redirectUrl = activeTrans.error_url;
        postbackUrl = activeTrans.callback_error_url;
        notice.error = data.simulate_fail;
      }
      console.log('Going to redirect user (for trans',
                  activeTrans._id, ') to', redirectUrl, 'post to',
                  postbackUrl);

      return notices.signedQs(notice);
    })
    .then(function redirectUser(signedNotice) {
      // In a real life app you might want to sanitize this URL
      // to protect against header location attacks. All input to create
      // this URL is submitted after Oauth authentication though so it
      // would just be a defense-in-depth thing here.
      res.header('Location',
                 redirectUrl + '?' + signedNotice);
      res.send(301);
      return signedNotice;
    })
    .then(function postBack(signedNotice) {
      /*jshint camelcase: false */
      request.post(postbackUrl, {form: {signed_notice: signedNotice}},
        function(error, response, body) {
          if (error || response.statusCode !== 200) {
            // In case of a real implementation, you should queue, retry and
            // notify the developer on ultimate failure.
            console.log('Postback against ' + postbackUrl + ' failed: ' + error + ' ' + body);
          } else {
            console.log('Postback against ' + postbackUrl + ' succeed: ' + body);
          }
        });
    })
    .catch(z.handleError(next));
};


var purchaseForm = forms.create({
  // This is the transaction token.
  tx: fields.string({
    required: true,
  }),
}, {
  validatePastFirstError: true,
});


exports.start = function(req, res, next) {
  var token;
  var pendingTrans;
  var activeTrans;
  var product;
  var seller;

  // We will start a new transaction after validating the form.
  req.zippySession.transactionId = null;

  purchaseForm.promise(req)
    .then(function retrieveTransactionKeys(data) {
      token = data.tx;
      return redisClient.keys('transaction-*');
    })
    .then(function retrievePendingTransaction(keys) {
      return when.map(keys, function retrieveTransaction(key) {
        return redisClient.hgetall(key)
          .then(function compareTokens(transaction) {
            if (transaction.token === token) {
              pendingTrans = transaction;
            }
          });
      });
    })
    .then(function activateTransaction() {
      if (!pendingTrans) {
        throw new errors.NotFoundError('transaction not found');
      }
      activeTrans = pendingTrans;
      if (activeTrans.status !== 'STARTED') {
        console.log('Attempt to start trans ' + activeTrans.token + ' ' +
                    'with status=' + activeTrans.status);
        throw new errors.BadRequestError('transaction cannot be started');
      }
      return activeTrans.product_id;
    })
    .then(function retrieveProduct(product_id) {
      return redisClient.hgetall('product-' + product_id);
    })
    .then(function checkProduct(_product) {
      if (!_product) {
        throw new Error('Zero matching products for product_id ' +
                             activeTrans.product_id);
      }
      product = _product;
      return product.seller_id;
    })
    .then(function retrieveSeller(seller_id) {
      return redisClient.hgetall('seller-' + seller_id);
    })
    .then(function checkSeller(_seller) {
      if (!_seller) {
        throw new Error('Zero matching sellers for id ' + product._id);
      }
      seller = _seller;
      return seller;
    })
    .then(function chooseRenderingView(seller) {
      req.zippySession.transactionId = activeTrans.uuid;

      // todo: choose which render func based on payment method.
      res.locals.context = {
        trans: activeTrans,
        product: product,
        seller: seller,
        processUrl: config.basePath + 'payment/process',
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
      return view(req, res);
    })
    .catch(z.handleError(next));
};
