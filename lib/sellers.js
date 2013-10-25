var restify = require('restify');
var save = require('save');

var sellers = save('sellers');

var serializeSeller = function (seller) {
  seller.resource_pk = seller._id;
  seller.resource_uri = '/seller/' + seller._id;
  delete seller._id;
  return seller;
};


function retrieveSellers (req, res, next) {
  res.docName = 'sellers';
  sellers.find({}, function (err, sellers) {
    sellers.forEach(serializeSeller);
    res.send(sellers);
  });
  next();
}


function retrieveSeller (req, res, next) {
  res.docName = 'seller';
  var uuid = req.params.uuid;
  if (uuid === undefined || uuid === '') {
    return next(new restify.InvalidArgumentError('UUID must be supplied.'));
  }
  sellers.findOne({uuid: uuid}, function (err, seller) {
    if (seller === undefined) {
      return next(new restify.ResourceNotFoundError('Resource with UUID "' + uuid + '" cannot be found.'));
    }
    res.send(serializeSeller(seller));
  });
  next();
}


function createSeller (req, res, next) {
  if (req.params.uuid === undefined || req.params.uuid === '') {
    return next(new restify.InvalidArgumentError('UUID must be supplied.'));
  }
  var seller = {
    uuid: req.params.uuid,
    active: true,
  };
  sellers.create(seller, function(err, seller) {
    res.send(201, serializeSeller(seller));
  });
  next();
}


module.exports = {
  retrieveSellers: retrieveSellers,
  retrieveSeller: retrieveSeller,
  createSeller: createSeller,
  sellers: sellers
};
