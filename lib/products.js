var errors = require('errors');
var under = require('underscore');
var when = require('when');

var forms = require('./restforms');
var fields = forms.fields;
var redisClient = require('./redisclient');
var z = require('./zutil');


var listProductsForm = forms.create({
  /*jshint camelcase: false */
  external_id: fields.string({
    required: false,
  }),
  seller_id: fields.string({
    required: false,
  }),
});


exports.list = function(req, res, next) {
  var query = {};
  var products = [];

  listProductsForm.promise(req)
    .then(function removeEmptyFields(data) {
      // Build a query from clean data of non-empty form field values.
      Object.keys(data).forEach(function(k) {
        if (data[k] !== '') {
          query[k] = data[k];
        }
      });
      return query.seller_id;
    })
    .then(function retrieveSeller(uuid) {
      return redisClient.hgetall('seller-' + uuid);
    })
    .then(function checkSellerExists(seller) {
      if (query.seller_id && !seller.uuid) {
        throw new errors.NotFoundError('seller with UUID ' + query.seller_id + ' not found');
      }
      return seller;
    })
    .then(function retrieveProductKeys() {
      // TODO: make a new key for seller specific products so that we don't have
      // to fetch all the products in the world.
      return redisClient.keys('product-*');
    })
    .then(function retrieveProducts(keys) {
      return when.map(keys, function retrieveProduct(key) {
        return redisClient.hgetall(key)
          .then(function storeProduct(product) {
            // If external_id was provided in the filter, only push
            // products that match.
            if ((query.external_id && product.external_id === query.external_id)
                || !query.external_id) {
              // If seller_id was provided in the filter, only push
              // products for that seller.
              if ((query.seller_id && product.seller_id === query.seller_id)
                  || !query.seller_id) {
                products.push(product);
              }
            }
          });
      });
    })
    .then(function serializeProducts() {
      var serialized = [];
      products.forEach(function(product) {
        serialized.push(z.serialize(product, 'products'));
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
  when(redisClient.hgetall('product-' + uuid))
    .then(function serializeProduct(product) {
      if (!product.uuid) {
        var error = 'Resource with UUID "' + uuid + '" cannot be found.';
        throw new errors.ResourceNotFoundError(error);
      }
      res.send(z.serialize(product, 'products'));
    })
    .catch(z.handleError(next));
};


var createProductForm = forms.create({
  uuid: fields.string({
    required: true,
    validators: [function(form, field, callback) {
      when(redisClient.hgetall('product-' + field.data))
        .then(function(product) {
          if (!product.uuid) {
            callback();  // uuid is unique, all good.
          } else {
            callback('UUID must be unique');
          }
        })
        .catch(callback);
    }],
  }),
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
  var product = {};

  createProductForm.promise(req)
    .then(function extendData(data) {
      product = under.extend(product, data);
      product.status = 'ACTIVE';
    })
    .then(function retrieveProductsKeys() {
      return redisClient.keys('product-*');
    })
    .then(function checkProductUnicity(keys) {
      return when.map(keys, function retrieveProduct(key) {
        return redisClient.hgetall(key)
          .then(function checkDuplicate(existingProduct) {
            if (existingProduct.external_id === product.external_id
               && existingProduct.seller_id === product.seller_id) {
              throw new errors.InvalidArgumentError('external_id must be unique per seller');
            }
          });
      });
    })
    .then(function createProduct() {
      return redisClient.hmset('product-' + product.uuid, product);
    })
    .then(function serializeProduct() {
      res.send(201, z.serialize(product, 'products'));
    })
    .catch(z.handleError(next));
};
