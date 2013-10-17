var Q = require('q');
var restify = require('restify');
var save = require('save');

var products = exports.products = save('products');
var sellers = require('./sellers').sellers;  // from save()


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/products/' + ob._id;
  delete ob._id;
  return ob;
}


function requireParams(req, kw) {
  // {field_name: "error message when missing"}
  for (var k in kw) {
    var msg = kw[k];
    if (req.params[k] === undefined || req.params[k] === null ||
      (typeof req.params[k] === 'string' && req.params[k] === '')) {
      return (new restify.MissingParameterError(msg));
    }
  }
}


exports.post = function(req, res, next) {
  if (err = requireParams(req,
        {seller_uuid: 'seller_uuid is required',
         external_id: 'external_id is required'})) {
    return next(err);
  }
  var ob = {
    seller_uuid: req.params.seller_uuid,
    external_id: req.params.external_id,
    active: true
  };
  Q.ninvoke(sellers, 'findOne', {uuid: ob.seller_uuid})
    .then(function(seller) {
      if (!seller) {
        throw new restify.ResourceNotFoundError(
                            'seller_uuid ' + ob.seller_uuid + ' not found');
      } else {
        return Q.ninvoke(products, 'create' , ob)
          .then(function(ob) {
            res.send(serialize(ob));
          });
      }
    })
    .fail(function(err) {
      return next(err);
    });
};