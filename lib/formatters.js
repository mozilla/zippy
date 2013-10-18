var fs = require('fs');
var marked = require('marked');
var nunjucks = require('nunjucks');
var path = require('path');

var env = new nunjucks.Environment();
var tmpl = env.getTemplate('./templates/documentation.html');


function formatDocumentation(req, res, body) {
  if (body instanceof Error) {
    res.statusCode = body.statusCode || 500;
    body = body.message;
  } else if (typeof (body) === 'object') {
    body = JSON.stringify(body);
  } else {
    body = body.toString();
  }
  if (res.docName !== undefined) {
    var docPath = './docs/' + res.docName + '.md';
    if (path.existsSync(docPath)) {
      var doc = fs.readFileSync(docPath, 'utf8');
      body = tmpl.render({
        title: res.serverName,
        content: marked(doc),
        result: body,  // TODO(davidbgk): add escaping.
      });
    }
  }
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.setHeader('Content-Type', 'text/html');
  return body;
}

module.exports = {
  'text/plain; q=0.5': formatDocumentation
};
