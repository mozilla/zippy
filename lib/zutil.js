var escape = require('escape-html');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));

var serialize = function serialize(ob, resource_name) {
  // Cloning the original object to avoid a scope issue.
  ob = JSON.parse(JSON.stringify(ob));
  ob.resource_pk = ob._id;
  ob.resource_name = resource_name;
  ob.resource_uri = '/' + resource_name + '/' + ob._id;
  delete ob._id;
  return ob;
};


module.exports = {
  escape: escape,
  markSafe: nunjucks.runtime.markSafe,
  rootPath: rootPath,
  serialize: serialize,
};
