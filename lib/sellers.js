var Q = require('q');
var restify = require('restify');
var save = require('save');
var under = require('underscore');

var models = exports.models = save('sellers');
var forms = require('./restforms');
var fields = forms.fields;
var z = require('./zutil');


function serialize(ob) {
  // Cloning the original object to avoid a scope issue.
  ob = JSON.parse(JSON.stringify(ob));
  ob.resource_pk = ob._id;
  ob.resource_uri = '/sellers/' + ob._id;
  delete ob._id;
  return ob;
}


function withSeller(uuid, next, cb) {
  if (!uuid) {
    return next(new restify.InvalidArgumentError('UUID must be supplied.'));
  }
  models.findOne({ uuid: uuid }, function (err, seller) {
    if (!seller) {
      var error = z.markSafe('Resource with UUID "' + z.escape(uuid) + '" cannot be found.');
      return next(new restify.ResourceNotFoundError({message: error}));
    }
    cb(err, seller);
  });
}


exports.list = function(req, res, next) {
  res.docName = 'sellers';
  models.find({}, function (err, sellers) {
    res.send(sellers.map(serialize));
  });
  next();
};


exports.retrieve = function(req, res, next) {
  res.docName = 'seller';
  withSeller(req.params.uuid, next, function (err, seller) {
    res.send(serialize(seller));
  });
  next();
};


var sellerForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      models.findOne({uuid: field.data}, function(err, product) {
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
  sellerForm.promise(req)
    .then(function(data) {
      return Q.ninvoke(models, 'create' , data);
    })
    .then(function(seller) {
      res.send(201, serialize(seller));
    })
    .fail(next);
};


exports.update = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    // TODO(davidbgk): validate data with the sellerForm.
    models.update(under.extend(seller, req.params), function (err, seller) {
      if (err) {
        return next(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
      }
      res.send(serialize(seller));
    });
  });
  next();
};


exports.delete = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    models.delete(seller._id, function (err) {
      if (err) {
        return next(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
      }
      res.send(204);
    });
  });
  next();
};
