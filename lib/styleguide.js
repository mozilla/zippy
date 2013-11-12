var fs = require('fs');
var path = require('path');

var z = require('./zutil');
var restify = require('restify');

var TEMPLATE_DIR = path.join(z.rootPath, 'templates/styleguide');
var DOC_EXT = '.html';
var DOCNAME_RX = new RegExp("^[A-Za-z_-]+$");


function getValidDocTemplates() {
  var docTemplates = fs.readdirSync(TEMPLATE_DIR);
  var validDocTemplates = [];
  for (var i=0, j=docTemplates.length; i<j; i++) {
    var tmpl = path.basename(docTemplates[i], DOC_EXT);
    if (DOCNAME_RX.test(tmpl)) {
      validDocTemplates.push(tmpl);
    } else {
      console.warn('AWOOGA: Styleguide template name ' + tmpl + ' did not match regex');
    }
  }
  return validDocTemplates;
}

var validDocTemplates = getValidDocTemplates();

module.exports = {
  retrieve: function (req, res, next) {
    var doc = req.params.doc;

    if (doc === 'index') {
      res.header('Location', '/styleguide');
      res.send(301);
      next();
    }

    if (typeof doc === 'undefined') {
      doc = 'index';
    }

    if (validDocTemplates.indexOf(doc) === -1) {
      var error = z.markSafe('Style doc "' + z.escape(doc) + '" cannot be found.');
      return next(new restify.ResourceNotFoundError({'message': error}));
    }

    var body = z.env.render(doc + DOC_EXT, {
      title: 'StyleGuide | ' + doc,
      docList: validDocTemplates,
    });
    res.send(body);
    next();
  }
};
