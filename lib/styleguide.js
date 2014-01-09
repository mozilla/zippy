var errors = require('errors');
var fs = require('fs');
var path = require('path');

var z = require('./zutil');

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
  retrieve: function (req, res) {
    var doc = req.params.doc;

    if (doc === 'index') {
      res.header('Location', '/styleguide');
      res.send(301);
    }

    if (typeof doc === 'undefined') {
      doc = 'index';
    }

    if (validDocTemplates.indexOf(doc) === -1) {
      throw new errors.ResourceNotFoundError('Style doc not found');
    }

    res.render(doc + DOC_EXT, {
      title: 'StyleGuide | ' + doc,
      docList: validDocTemplates,
    });
  }
};
