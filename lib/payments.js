'use strict';

var Q = require('q');
var querystring = require('querystring');
var restify = require('restify');
var trans = require('./trans');


exports.confirmPayment = function (req, res, next) {
  var body = res.render('confirm.html', {
    title: 'Confirm Payment',
  });
  res.send(body);
  next();
};


exports.creditCard = function (req, res, next) {
  var body = res.render('credit-card.html', {
    title: 'Pay by Card',
  });
  res.send(body);
  next();
};


exports.processPayment = function (req, res, next) {
  Q.promise(function(resolve) {
      if (!req.zippySession.transactionId) {
        throw new restify.ConflictError(
                    'Cannot process payment; no transactionId in session');
      }
      resolve(req.zippySession.transactionId);
    })
    .then(function(activeTransId) {
      console.log('updating transaction', activeTransId);
      var defer = Q.defer();

      trans.models.update({
        _id: activeTransId,
        status: 'PROCESSED',
      }, false, function(err, activeTrans) {
        if (err) {
          return defer.reject(err);
        }
        defer.resolve(activeTrans);
      });

      return defer.promise;
    })
    .then(function(activeTrans) {
      console.log('ok, updated trans', activeTrans);
      var notice = {
        ext_transaction_id: activeTrans.ext_transaction_id,
      };

      // In a real life app you might want to sanitize this URL
      // to protect against header location attacks. All input to create
      // this URL is submitted after Oauth authentication though so it
      // would just be a defense-in-depth thing here.
      res.header('Location',
                 activeTrans.success_url + '?' + querystring.stringify(notice));
      res.send(301);
      next();
    })
    .fail(function(err) {
      console.log('Error', err);  // fixme: bug 938352
      next(err);
    });
};
