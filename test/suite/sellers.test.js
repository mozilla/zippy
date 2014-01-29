var uuid = require('node-uuid');

var Client = require('../client').Client;
var helpers = require('../helpers');

var client = new Client('/sellers');


exports.setUp = function(done) {
  helpers.resetDB()
    .then(done)
    .catch(function(err) {
      throw err;
    });
};


exports.createSeller = function(t) {
  var seller = {
    uuid: uuid.v4(),
  };
  client
    .post({
      uuid: seller.uuid,
      status: 'ACTIVE',
      name: 'John',
      email: 'jdoe@example.org',
    })
    .expect(201)
    .end(function(err, res) {
      t.ifError(err);
      /*jshint camelcase: false */
      t.equal(res.body.resource_pk, seller.uuid);
      t.done();
    });
};


exports.createSellerWithoutStatus = function(t) {
  var seller = {
    uuid: uuid.v4(),
  };
  client
    .post({
      uuid: seller.uuid,
      name: 'John',
      email: 'jdoe@example.org',
    })
    .expect(409)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.error.name, 'InvalidArgumentError');
      t.done();
    });
};


exports.retrieveSellers = function(t) {
  helpers.withSeller({}, function(seller) {
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        /*jshint camelcase: false */
        t.equal(res.body[0].resource_pk, seller.uuid);
        t.done();
      });
  });
};


exports.retrieveSellersEmpty = function(t) {
  client
    .get()
    .expect(200)
    .end(function(err, res) {
      t.ifError(err);
      t.equal(res.body.length, 0);
      t.done();
    });
};


exports.retrieveSeller = function(t) {
  helpers.withSeller({}, function(seller) {
    var client = new Client('/sellers/' + seller.uuid);
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        /*jshint camelcase: false */
        t.equal(res.body.resource_pk, seller.uuid);
        t.equal(res.body.resource_name, 'sellers');
        t.done();
      });
  });
};


exports.updateSellerThenGet = function(t) {
  helpers.withSeller({}, function(seller) {
    var client = new Client('/sellers/' + seller.uuid);
    var updatedName = 'Jack';
    client
      .put({
        uuid: seller.uuid,
        status: seller.status,
        name: updatedName,
        email: seller.email,
      })
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        /*jshint camelcase: false */
        t.equal(res.body.resource_pk, seller.uuid);
        t.equal(res.body.name, updatedName, 'name following PUT incorrect');
        t.equal(res.body.email, seller.email);
        t.equal(res.body.resource_uri, '/sellers/' + res.body.uuid);
        client
          .get()
          .expect(200)
          .end(function(err, res) {
            t.ifError(err);
            t.equal(res.body.resource_pk, seller.uuid);
            t.equal(res.body.name, updatedName, 'name following PUT then GET incorrect');
            t.equal(res.body.email, seller.email);
            t.equal(res.body.resource_uri, '/sellers/' + res.body.uuid);
            t.done();
          });
      });
  });
};


exports.deleteSeller = function(t) {
  helpers.withSeller({}, function(seller) {
    var client = new Client('/sellers/' + seller.uuid);
    client
      .del()
      .expect(204)
      .end(function(err) {
        t.ifError(err);
        t.done();
      });
  });
};


exports.retrieveSellerTerms = function(t) {
  helpers.withSeller({}, function(seller) {
    var client = new Client('/terms/' + seller.uuid);
    client
      .get()
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        t.equal(res.body.text, 'Terms for seller: ' + seller.name);
        t.done();
      });
  });
};


exports.updateSellerTerms = function(t) {
  helpers.withSeller({}, function(seller) {
    var client = new Client('/sellers/' + seller.uuid);
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth();
    currentMonth++;
    var date = currentDate.getFullYear() + '-' + currentMonth + '-' + currentDate.getDate();
    var testDate = new Date(date);
    client
      .put({
        uuid: seller.uuid,
        status: seller.status,
        name: seller.name,
        email: seller.email,
        agreement: date,
      })
      .expect(200)
      .end(function(err, res) {
        t.ifError(err);
        /*jshint camelcase: false */
        t.equal(res.body.resource_pk, seller.uuid);
        // Check date is with 2 secs of the current date.
        var date1 = new Date(res.body.agreement);
        t.dateCloseTo(date1, testDate);
        client = new Client('/terms/' + seller.uuid);
        client
          .get()
          .expect(200)
          .end(function(err, res) {
            t.ifError(err);
            t.equal(res.body.text, 'Terms for seller: ' + seller.name);
            var date2 = new Date(res.body.agreement);
            t.dateCloseTo(date2, testDate);
            t.done();
          });
      });
  });
};
