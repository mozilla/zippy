var restify = require('restify');
var Q = require('q');

var trans = require('./trans');
var z = require('./zutil');


exports.confirmPayment = function (req, res, next) {
  var body = z.env.render('confirm.html', {
    title: 'Confirm Payment',
  });
  res.send(body);
  next();
};


exports.creditCard = function (req, res, next) {
  var body = z.env.render('credit-card.html', {
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
      // TODO: Redirect to success URL, bug 945890.
      res.header('Location', '/');
      res.send(301);
      next();
    })
    .fail(function(err) {
      console.log('Error', err);  // fixme: bug 938352
      next(err);
    });
};
