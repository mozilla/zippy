var fs = require('fs');
var marked = require('marked');
var nunjucks = require('nunjucks');
var path = require('path');

var helpers = require('./helpers');

var rootPath = helpers.rootPath;
var templateLoader = new nunjucks.FileSystemLoader(path.join(rootPath, 'templates'));
var env = new nunjucks.Environment(templateLoader, { autoescape: true });
var tmpl = env.getTemplate('documentation.html');


function formatDocumentation(req, res, body) {
  if (body instanceof Error) {
    res.statusCode = body.statusCode || 500;
    body = body.message;
  } else if (typeof (body) === 'object') {
    body = JSON.stringify(body);
  } else {
    body = body.toString();
  }
  if (typeof res.docName !== 'undefined') {
    var docPath = path.join(rootPath, 'docs', res.docName + '.md');
    if (fs.existsSync(docPath)) {
      var doc = fs.readFileSync(docPath, 'utf8');
      body = tmpl.render({
        title: res.serverName,
        content: helpers.markSafe(marked(doc)), // Tell nunjucks markdown is safe.
        result: body,
      });
    }
  }
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.setHeader('Content-Type', 'text/html');
  return body;
}

module.exports = {
  'text/html': formatDocumentation
};
