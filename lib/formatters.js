var fs = require('fs');
var marked = require('marked');
var nunjucks = require('nunjucks');
var path = require('path');

var z = require('./zutil');
var BASE_DOCS_PATH = path.join(z.rootPath, 'docs');

function formatHTML(req, res, body) {
  var data;
  var content;

  if (body instanceof Error) {
    res.statusCode = body.statusCode || 500;

    // If there's no doc then make this a full-page error.
    if (res.docName === undefined) {
      data = body.body;
      content = data.message;
      if (typeof content !== 'string' &&
          !(content instanceof nunjucks.runtime.SafeString)) {
        // Content is probably an object so let's make it readable.
        content = JSON.stringify(content);
      }
      body = z.env.render('error.html', {
        title: 'Error',
        code: data.code,
        content: content,
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
