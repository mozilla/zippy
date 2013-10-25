var Q = require('q');
var save = require('save');
var under = require('underscore');

var products = exports.products = save('products');
var forms = require('./restforms');
var fields = forms.fields;


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
      products.findOne({external_id: field.data}, function(err, product) {
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
    validators: [forms.validators.isValidSeller({active: true})]
  }),
});


exports.create = function(req, res, next) {
  var ob = {};

  productForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);
      ob.active = true;
    })
    .then(function() {
      return Q.ninvoke(products, 'create' , ob);
    })
    .then(function(ob) {
      res.send(201, serialize(ob));
    })
    .fail(function(err) {
      next(err);
    });
};
