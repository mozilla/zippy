var errors = require('errors');
var under = require('underscore');
var when = require('when');

var forms = require('./restforms');
var fields = forms.fields;
var redisClient = require('./redisclient');
var z = require('./zutil');


exports.list = function(req, res, next) {
  var sellers = [];

  when(redisClient.keys('seller-*'))
    .then(function retrieveSellers(keys) {
      return when.map(keys, function retrieveSeller(key) {
        return redisClient.hgetall(key)
          .then(function storeSeller(seller) {
            sellers.push(seller);
          });
      });
    })
    .then(function serializeSellers() {
      var serialized = [];
      sellers.forEach(function(seller) {
        serialized.push(z.serialize(seller, 'sellers'));
      });
      res.send(serialized);
    })
    .catch(z.handleError(next));
};


exports.retrieve = function(req, res, next) {
  var uuid = req.params.uuid;
  if (!uuid) {
    return new errors.InvalidArgumentError('UUID must be supplied.');
  }
  when(redisClient.hgetall('seller-' + uuid))
    .then(function serializeSeller(seller) {
      if (!seller.uuid) {
        var error = 'Resource with UUID "' + uuid + '" cannot be found.';
        throw new errors.ResourceNotFoundError(error);
      }
      res.send(z.serialize(seller, 'sellers'));
    })
    .catch(z.handleError(next));

};


exports.terms = function(req, res, next) {
  var uuid = req.params.uuid;
  if (!uuid) {
    return new errors.InvalidArgumentError('UUID must be supplied.');
  }
  when(redisClient.hgetall('seller-' + uuid))
    .then(function serializeTerms(seller) {
      if (!seller.uuid) {
        var error = 'Resource with UUID "' + uuid + '" cannot be found.';
        throw new errors.ResourceNotFoundError(error);
      }
      res.send({
        // This is a placeholder for real terms of services.
        text: 'Terms for seller: ' + seller.name,
        agreement: seller.agreement,
      });
    })
    .catch(z.handleError(next));
};


var createSellerForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      when(redisClient.hgetall('seller-' + field.data))
        .then(function(seller) {
          if (!seller.uuid) {
            callback();  // uuid is unique, all good.
          } else {
            callback('UUID must be unique');
          }
        })
        .catch(callback);
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
}, {
  validatePastFirstError: true,
});


exports.create = function(req, res, next) {
  var seller = {};

  createSellerForm.promise(req)
    .then(function extendData(data) {
      return under.extend(seller, data);
    })
    .then(function createSeller(seller) {
      return redisClient.hmset('seller-' + seller.uuid, seller);
    })
    .then(function serializeSeller() {
      res.send(201, z.serialize(seller, 'sellers'));
    })
    .catch(z.handleError(next));
};


var updateSellerForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [forms.validators.isValidSeller()],
  }),
  status: fields.string({
    validators: [
      forms.validators.mustBeOneOf(['ACTIVE', 'INACTIVE', 'DISABLED'])
    ],
  }),
  name: fields.string(),
  email: fields.email(),
  // We just store an optional datetime here, the logic is left to the client.
  agreement: fields.date(),
});


exports.update = function(req, res, next) {
  var seller = {};

  updateSellerForm.promise(req)
    .then(function retrieveSeller(data) {
      seller = data;
      return redisClient.hgetall('seller-' + data.uuid);
    })
    .then(function extendData(_seller) {
      return under.extend({}, _seller, seller);
    })
    .then(function updateSeller(seller) {
      return redisClient.hmset('seller-' + seller.uuid, seller);
    })
    .then(function serializeSeller() {
      res.send(z.serialize(seller, 'sellers'));
    })
    .catch(z.handleError(next));
};


exports.delete = function(req, res, next) {
  when(redisClient.del('seller-' + req.params.uuid))
    .then(function noContent() {
      res.send(204);
    })
    .catch(z.handleError(next));
};
