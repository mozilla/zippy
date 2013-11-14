var Q = require('q');
var errors = require('restify').errors;

var forms = require('./restforms');
var products = require('./products');
var trans = require('./trans');
var z = require('./zutil');

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

  purchaseForm.promise(req)
    .then(function(data) {
      return Q.ninvoke(trans.models, 'findOne', {token: data.tx});
    })
    .then(function(trans) {
      if (!trans) {
        throw new errors.NotFoundError('transaction not found');
      }
      if (trans.status !== 'STARTED') {
        console.log('Attempt to start trans ' + trans.token + ' ' +
                    'with status=' + trans.status);
        throw new errors.BadRequestError('transaction cannot be started');
      }
      activeTrans = trans;
    })
    .then(function() {
      return Q.ninvoke(products.models, 'findOne', {_id: trans.product_id});
    })
    .then(function(product) {
      product = product;
    })
    .then(function() {
      res.send(z.env.render('home/home.html', {
        content: 'the content',
        trans: activeTrans,
        product: product,
      }));
      next();
    })
    .fail(next);
};
