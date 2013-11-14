var Q = require('q');
var save = require('save');
var under = require('underscore');

var constants = require('./constants');
var forms = require('./restforms');
var fields = forms.fields;
var models = exports.models = save('products');


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/products/' + ob._id;
  delete ob._id;
  return ob;
}


var productForm = forms.create({
  external_id: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      models.findOne({external_id: field.data}, function(err, product) {
        if (err) {
          callback(err);
        } else if (!product) {
          callback();  // external_id is unique, all good.
        } else {
          callback('external_id must be unique');
        }
      });
    }],
  }),
  seller_id: fields.integer({
    required: true,
    validators: [forms.validators.isValidSeller({status: constants.ACTIVE})]
  }),
});


exports.create = function(req, res, next) {
  var ob = {};

  productForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);
      ob.status = constants.ACTIVE;
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
