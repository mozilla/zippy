var Q = require('q');
var restify = require('restify');
var save = require('save');
var under = require('underscore');

var models = exports.models = save('products');
var forms = require('./restforms');
var fields = forms.fields;


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/products/' + ob._id;
  delete ob._id;
  return ob;
}


var productForm = forms.create({
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

  productForm.promise(req)
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
