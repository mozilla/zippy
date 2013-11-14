var fs = require('fs');
var marked = require('marked');
var path = require('path');

var z = require('./zutil');
var BASE_DOCS_PATH = path.join(z.rootPath, 'docs');

function formatHTML(req, res, body) {

  if (body instanceof Error) {
    res.statusCode = body.statusCode || 500;
    body = body.message;

    // If there's no doc then make this a full-page error.
    if (res.docName === undefined) {
      body = z.env.render('error.html', {
        title: 'Error',
        content: body,
      });
    }

  } else if (typeof (body) === 'object') {
    body = JSON.stringify(body);
  } else {
    body = body.toString();
  }

  // Special case handling of documented responses.
  if (res.docName !== undefined) {
    body = formatDocumentation(req, res, body);
  }

  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.setHeader('Content-Type', 'text/html');
  return body;
}

function formatDocumentation(req, res, body) {
  var docPath = path.normalize(path.join(BASE_DOCS_PATH, res.docName + '.md'));
  if (fs.existsSync(docPath) && docPath.indexOf(BASE_DOCS_PATH) === 0) {
    var doc = fs.readFileSync(docPath, 'utf8');
    body = z.env.render('base-docs.html', {
      title: res.serverName,
      content: z.markSafe(marked(doc)), // Tell nunjucks markdown is safe.
      result: body,
    });
  }
  return body;
}

module.exports = {
  'text/html': formatHTML
};
