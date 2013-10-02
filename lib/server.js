var assert = require('assert-plus');
var bunyan = require('bunyan');
var restify = require('restify');

var formatters = require('./formatters.js');
var handlers = require('./handlers.js');
var sellers = require('./sellers.js');


function createServer(options) {
    assert.object(options, 'options');
    assert.object(options.log, 'options.log');

    var server = restify.createServer({
        log: options.log,
        name: 'zippy',
        formatters: formatters,
    });

    server.use(restify.requestLogger());
    server.use(restify.bodyParser());

    server.get('/', handlers.home);
    server.get('/sellers', sellers.retrieveSellers);
    server.post('/sellers', sellers.createSeller);
    server.get('/sellers/:uuid', sellers.retrieveSeller);
    server.get(/\/css\/?.*/, restify.serveStatic({
        directory: './statics'
    }));

    if (!options.noAudit) {
        server.on('after', restify.auditLogger({
            body: true,
            log: bunyan.createLogger({
                level: 'info',
                name: 'zippy-audit',
                stream: process.stdout,
            })
        }));
    }

    return (server);
}

module.exports = {
    createServer: createServer
};
