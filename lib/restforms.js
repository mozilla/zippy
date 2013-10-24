/*
 * Restify adapter for the forms module.
 * Docs: https://github.com/caolan/forms
 */
var forms = require('forms');
var fields = forms.fields;
var Q = require('q');
var restify = require('restify');
var under = require('underscore');


// Expose all of forms' exports.
under.extend(module.exports, forms);


// Add some new fields.

exports.fields.money = function (opt) {
  opt = opt || {};
  opt.validators = opt.validators || [];
  opt.validators.splice(0, 0,
      forms.validators.regexp(
              /[0-9]+\.[0-9]{2}/,
              'This field must be in the format of 0.00.'));

  return fields.string(opt);
};


exports.fields.integer = function(opt) {
  opt.validators = opt.validators || [];
  opt.validators.splice(0, 0,
      forms.validators.regexp(/[0-9]+/, 'This field must be numeric.'));
  return fields.number(opt);
};


// Add some validators.

exports.validators.isValidProduct = function(query) {
  query = query || {};
  var products = require('./products').products;

  return function(form, field, callback) {
    var q = {_id: field.data.toString()};
    under.extend(q, query);
    products.findOne(q, function(err, product) {
      if (err) {
        callback(err);
      } else if (!product) {
        callback('zero results for product_id ' + field.data);
      } else {
        callback();
      }
    });
  };
};


exports.validators.isValidSeller = function(query) {
  query = query || {};
  var sellers = require('./sellers').sellers;

  return function (form, field, callback) {
    var q = {_id: field.data.toString()};
    under.extend(q, query);
    sellers.findOne(q, function(err, seller) {
      if (err) {
        callback(err);
      } else if (!seller) {
        callback('zero results for seller_id ' + field.data);
      } else {
        callback();
      }
    });
  };
};


exports.validators.mustBeOneOf = function(choices) {
  return function (form, field, callback) {
    if (choices.indexOf(field.data) === -1) {
      callback('value must be one of ' + choices.join(', '));
    } else {
      callback();
    }
  };
};


// Make a custom forms.create()
exports.create = function() {
  var ob = forms.create.apply(this, arguments);

  /*
   * Return a promise to validate the form.
   *
   * Example in a Restify handler:
   *
   *  var myForm = restforms.create(...);
   *
   *  exports.post = function(req, res, next) {
   *    myForm.promise(req)
   *      .then(function(data) {
   *        // The form is valid.
   *        // access data.field
   *        res.send(...);
   *      })
   *      .fail(function(err) {
   *        next(err);
   *      });
   *  };
   */
  ob.promise = function(req) {
    var self = this;
    return Q.promise(function(resolve, reject) {

      function getErrors(form) {
        return Object.keys(form.fields).reduce(function (ob, k) {
          var data = form.fields[k];
          if (data.error) {
            ob[k] = data.error;
          }
          return ob;
        }, {});
      }

      var newForm = self.bind(req.params);
      newForm.validate(function(err, form) {
        if (err) {
          reject(err);
        } else if (form.isValid()) {
          resolve(form.data);
        } else {
          reject(new restify.InvalidArgumentError({message: getErrors(form)}));
        }
      });
    });
  };

  return ob;
};
