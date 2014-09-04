var crypto = require('crypto');
var errors = require('errors');
var querystring = require('querystring');
var when = require('when');

var config = require('./config');
var forms = require('./restforms');
var fields = forms.fields;
var z = require('./zutil');

errors.create({name: 'SignatureError'});

exports.signedQs = function(ob) {
  // Takes an object and returns a promise. When fulfilled, the promise
  // makes a query string, signs it, and returns a full query string
  // including the signature.
  return when.promise(function(resolve) {
    var qs = querystring.stringify(ob);
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
    throw new errors.SignatureError('config.signatureKeys cannot be empty');
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
      throw new errors.SignatureError('no keys found in config.signatureKeys');
    }
    opt.id = all.pop().toString();
  }

  return {id: opt.id, key: opt.keys[opt.id]};
};


var noticeForm = forms.create({
  qs: fields.string({
    required: true
  }),
}, {
  validatePastFirstError: true,
});


exports.verify = function(req, res, next) {
  // Take an incoming query string and verify
  // that the signature matches.
  noticeForm.promise(req)
    .then(function checkSignatureMatching(data) {
      var parts = data.qs.match(/^(.+)&sig=([0-9]+):(.+)$/);
      console.log('attempt to process query string notice', data.qs);
      if (!parts) {
        throw new errors.InvalidArgumentError(
                          'malformed query string or missing signature');
      }
      var notice = parts[1];
      var id = parseInt(parts[2], 10);
      var sig = parts[3];
      var result = sign(notice, {id: id}).sig === sig;
      var reason = result ? '': 'signature mismatch';
      res.send(200, {
        result: result ? 'OK': 'FAIL',
        reason: reason,
      });
    })
    .catch(z.handleError(next));
};
