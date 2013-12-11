var Q = require('q');
var errors = require('restify').errors;

var forms = require('./restforms');
var products = require('./products');
var sellers = require('./sellers');
var trans = require('./trans');

var fields = forms.fields;

var purchaseForm = forms.create({
  // This is the transaction token.
  tx: fields.string({
    required: true,
  }),
});


exports.get = function (req, res, next) {
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

      res.send(res.render('home/home.html', {
        trans: activeTrans,
        product: product,
        seller: seller,
        processUrl: '/payment/process',
      }));
      next();
    })
    .fail(function(err) {
      console.log('Error', err);  // fixme: bug 938352
      next(err);
    });
};
