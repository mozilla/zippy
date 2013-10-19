var Q = require('q');
var restify = require('restify');
var save = require('save');
var zutil = require('./zutil');

var products = exports.products = save('products');
var sellers = require('./sellers').sellers;  // from save()


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/products/' + ob._id;
  delete ob._id;
  return ob;
}


exports.post = function(req, res, next) {
  var ob = {};

  zutil.requireParams(req,
                      {seller_id: 'seller_id is required',
                       external_id: 'external_id is required'})
    .then(function() {
      ob = {
        seller_id: req.params.seller_id,
        external_id: req.params.external_id,
        active: true
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
      return Q.ninvoke(products, 'create' , ob);
    })
    .then(function(ob) {
      res.send(serialize(ob));
    })
    .fail(function(err) {
      next(err);
    });
};
