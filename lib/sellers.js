var errors = require('errors');
var Q = require('q');
var save = require('save');
var under = require('underscore');

var forms = require('./restforms');
var fields = forms.fields;
var models = exports.models = save('sellers');
var z = require('./zutil');


function withSeller(uuid, next, cb) {
  if (!uuid) {
    return next(new errors.InvalidArgumentError('UUID must be supplied.'));
  }
  models.findOne({_id: uuid}, function (err, seller) {
    if (!seller) {
      var error = 'Resource with UUID "' + uuid + '" cannot be found.';
      throw new errors.ResourceNotFoundError(error);
    }
    cb(err, seller);
  });
}


exports.retrieve = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    if (err) {
      return next(err);
    }
    res.send(z.serialize(seller, 'sellers'));
  });
};


exports.terms = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    if (err) {
      return next(err);
    }
    res.send({
      // This is a placeholder for real terms of services.
      text: 'Terms for seller: ' + seller.name,
      agreement: seller.agreement,
    });
  });
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
    models.update(under.extend(seller, req.body), function (err, seller) {
      if (err) {
        throw new errors.InvalidArgumentError(JSON.stringify(err.errors));
      }
      res.send(z.serialize(seller, 'sellers'));
    });
  });
};


exports.delete = function(req, res, next) {
  withSeller(req.params.uuid, next, function (err, seller) {
    models.delete(seller._id, function (err) {
      if (err) {
        throw new errors.InvalidArgumentError(JSON.stringify(err.errors));
      }
      res.send(204);
    });
  });
};
