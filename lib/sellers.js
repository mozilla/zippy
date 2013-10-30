var escape = require('escape-html');
var Q = require('q');
var restify = require('restify');
var save = require('save');
var under = require('underscore');

var sellers = exports.sellers = save('sellers');
var forms = require('./restforms');
var fields = forms.fields;


function serialize(ob) {
  ob.resource_pk = ob._id;
  ob.resource_uri = '/sellers/' + ob._id;
  delete ob._id;
  return ob;
}


exports.list = function(req, res, next) {
  res.docName = 'sellers';
  sellers.find({}, function (err, sellers) {
    sellers.forEach(serialize);
    res.send(sellers);
  });
  next();
};


exports.retrieve = function(req, res, next) {
  res.docName = 'seller';
  var uuid = req.params.uuid;
  if (uuid === undefined || uuid === '') {
    return next(new restify.InvalidArgumentError('UUID must be supplied.'));
  }
  sellers.findOne({ uuid: uuid }, function (err, seller) {
    if (seller === undefined) {
      return next(new restify.ResourceNotFoundError('Resource with UUID "' + escape(uuid) + '" cannot be found.'));
    }
    res.send(serialize(seller));
  });
  next();
};


var sellerForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      sellers.findOne({uuid: field.data}, function(err, product) {
        if (err) {
          callback(err);
        } else if (!product) {
          callback();  // uuid is unique, all good.
        } else {
          callback('uuid must be unique');
        }
      });
    }],
  }),
  status: fields.string({
    required: true,
    validators: [
      forms.validators.mustBeOneOf(['ACTIVE', 'INACTIVE', 'DISABLED'])
    ],
  }),
  name: fields.string({
    required: true,
  }),
  email: fields.email({
    required: true,
  }),
});


exports.create = function(req, res, next) {
  var ob = {};

  sellerForm.promise(req)
    .then(function(data) {
      under.extend(ob, data);
    })
    .then(function() {
      return Q.ninvoke(sellers, 'create' , ob);
    })
    .then(function(ob) {
      res.send(201, serialize(ob));
    })
    .fail(function(err) {
      next(err);
    });
};

