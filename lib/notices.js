var crypto = require('crypto');
var querystring = require('querystring');
var Q = require('q');
var restify = require('restify');

var config = require('./config');
var constants = require('./constants');
var forms = require('./restforms');
var fields = forms.fields;


exports.signedQs = function(qsParams) {
  // Takes query string params, makes a query string, signs it, and returns a
  // full query string that includes the signature.
  return Q.promise(function(resolve) {
    var qs = querystring.stringify(qsParams);
    var sigInfo = sign(qs);
    resolve(qs + '&sig=' + sigInfo.id + ':' + sigInfo.sig);
  });
};


function sign(blob, keyOpt) {
  var keystore = exports.getKey(keyOpt);
  return {
    id: keystore.id,
    sig: crypto.createHmac('sha256', keystore.key).update(blob).digest('hex')
  };
}


exports.getKey = function(opt) {
  opt = opt || {};
  opt.id = opt.id || undefined;  // ID of key to use. Defaults to latest.
  opt.keys = opt.keys || config.signatureKeys;

  if (!opt.keys) {
    throw new Error('config.signatureKeys cannot be empty');
  }
  if (!opt.id) {
    // Get the latest numeric key.
    var all = [];
    for (var k in opt.keys) {
      all.push(parseInt(k, 10));
    }
    all.sort(function(a, b){
      return a - b;
    });
    if (!all.length) {
      throw new Error('no keys found in config.signatureKeys');
    }
    opt.id = all.pop().toString();
  }

  return {id: opt.id, key: opt.keys[opt.id]};
};


var noticeForm = forms.create({
  qs: fields.string({
    required: true
  }),
});


exports.create = function(req, res, next) {
  // Take an incoming query string and verify
  // that the signature matches.
  noticeForm.promise(req)
    .then(function(data) {
      var parts = data.qs.match(/^(.+)&sig=([0-9]+):(.+)$/);
      if (!parts) {
        throw new restify.InvalidArgumentError(
                    'malformed query string or missing signature');
      }
      var notice = parts[1];
      var id = parseInt(parts[2], 10);
      var sig = parts[3];
      var result = sign(notice, {id: id}).sig === sig;
      var reason = result ? '' : 'signature mismatch';
      res.send(200, {
        result: result ? constants.OK : constants.FAIL,
        reason: reason,
      });
    })
    .fail(function(err) {
      next(err);
    });
};
