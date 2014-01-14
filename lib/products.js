var errors = require('errors');
var Q = require('q');
var save = require('save');
var under = require('underscore');

var forms = require('./restforms');
var fields = forms.fields;
var models = exports.models = save('products');
var z = require('./zutil');


exports.retrieve = function(req, res, next) {
  Q.ninvoke(models, 'findOne', {_id: req.params.uuid})
    .then(function(product) {
      if (!product) {
        throw new errors.NotFoundError('product with UUID ' + req.params.uuid + ' not found');
      }
      res.send(z.serialize(product, 'products'));
    })
    .fail(function(err) {
      next(err);
    });
};


var createProductForm = forms.create({
  /*jshint camelcase: false */
  name: fields.string({
    required: true,
  }),
  external_id: fields.string({
    required: true,
  }),
  // The seller_id field seems like it should be an int
  // but that gave me a lot of grief. I don't like to be sad. -Kumar
  seller_id: fields.string({
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
        throw new errors.InvalidArgumentError('external_id must be unique per seller');
      }
    })
    .then(function() {
      return Q.ninvoke(models, 'create' , ob);
    })
    .then(function(ob) {
      res.send(201, z.serialize(ob, 'products'));
    })
    .fail(function(err) {
      next(err);
    });
};
