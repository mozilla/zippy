var Q = require('q');
var restify = require('restify');
var save = require('save');
var under = require('underscore');

var models = exports.models = save('products');
var forms = require('./restforms');
var sellers = require('./sellers');
var fields = forms.fields;


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/products/' + ob._id;
  delete ob._id;
  return ob;
}


var listProductsForm = forms.create({
  external_id: fields.string({
    required: false,
  }),
  seller_uuid: fields.string({
    required: false,
  }),
  seller_id: fields.string({
    required: false,
  }),
});


exports.list = function(req, res, next) {
  var query = {};

  listProductsForm.promise(req)
    .then(function(data) {
      // Build a query from clean data of non-empty form field values.
      Object.keys(data).forEach(function(k) {
        if (data[k] !== '') {
          query[k] = data[k];
        }
      });
      if (query.seller_uuid) {
        return Q.ninvoke(sellers.models, 'findOne', {uuid: query.seller_uuid})
          .then(function(seller) {
            // If seller by UUID was found then adjust the query to filter
            // by seller ID. When seller by UUID is not found, make the ID
            // undefined so that the query retrieves zero results.
            var sId = seller ? seller._id : undefined;
            query.seller_id = sId;
            delete query.seller_uuid;
          });
      }
    })
    .then(function() {
      return Q.ninvoke(models, 'find', query);
    })
    .then(function(products) {
      res.send(products.map(serialize));
    })
    .fail(function(err) {
      next(err);
    });
};


exports.retrieve = function(req, res, next) {
  Q.ninvoke(models, 'findOne', {_id: req.params.uuid})
    .then(function(product) {
      if (!product) {
        throw new restify.NotFoundError({
          message: 'product with UUID ' + req.params.uuid + ' not found'
        });
      }
      res.send(serialize(product));
    })
    .fail(function(err) {
      next(err);
    });
};


var createProductForm = forms.create({
  name: fields.string({
    required: true,
  }),
  external_id: fields.string({
    required: true,
  }),
  seller_id: fields.integer({
    required: true,
    validators: [forms.validators.isValidSeller({status: 'ACTIVE'})]
  }),
});


exports.create = function(req, res, next) {
  var ob = {};

  createProductForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);
      ob.status = 'ACTIVE';
    })
    .then(function() {
      return Q.ninvoke(models, 'findOne', {
        seller_id: ob.seller_id.toString(),
        external_id: ob.external_id.toString(),
      });
    })
    .then(function(dupeProduct) {
      if (dupeProduct) {
        throw new restify.InvalidArgumentError({
          message: 'external_id must be unique per seller'
        });
      }
    })
    .then(function() {
      return Q.ninvoke(models, 'create' , ob);
    })
    .then(function(ob) {
      res.send(201, serialize(ob));
    })
    .fail(function(err) {
      next(err);
    });
};
