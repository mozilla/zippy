var Q = require('q');
var restify = require('restify');
var save = require('save');
var under = require('underscore');

var models = exports.models = save('sellers');
var forms = require('./restforms');
var fields = forms.fields;
var z = require('./zutil');


function withSeller(uuid, next, cb) {
  if (!uuid) {
    return next(new restify.InvalidArgumentError('UUID must be supplied.'));
  }
  models.findOne({_id: uuid}, function (err, seller) {
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
    res.send(sellers.map(z.serialize, 'sellers'));
  });
  next();
};


exports.retrieve = function(req, res, next) {
  res.docName = 'seller';
  withSeller(req.params.uuid, next, function (err, seller) {
    res.send(z.serialize(seller, 'sellers'));
  });
  next();
};


exports.terms = function(req, res, next) {
  res.docName = 'sellerTerms';
  withSeller(req.params.uuid, next, function (err, seller) {
    res.send({
      // This is a placeholder for real terms of services.
      text: 'Terms for seller: ' + seller.name,
      agreement: seller.agreement,
    });
  });
  next();
};


var sellerForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      models.findOne({_id: field.data}, function(err, seller) {
        if (err) {
          callback(err);
        } else if (!seller) {
          callback();  // uuid is unique, all good.
        } else {
          callback('UUID must be unique');
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
  // We just store an optional datetime here, the logic is left to the client.
  agreement: fields.date(),
});


exports.create = function(req, res, next) {
  sellerForm.promise(req)
    .then(function(data) {
      // The UUID is stored internally as _id to ease "save" integration.
      data._id = data.uuid;
      delete data.uuid;
      return Q.ninvoke(models, 'create' , data);
    })
    .then(function(seller) {
      res.send(201, z.serialize(seller, 'sellers'));
    })
    .fail(next);
};


exports.update = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    // TODO(davidbgk): validate data with the sellerForm.
    delete req.params.uuid;
    models.update(under.extend(seller, req.params), function (err, seller) {
      if (err) {
        return next(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
      }
      res.send(z.serialize(seller, 'sellers'));
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
