Zippy Config
============

Config works by overlaying additional rules on top of the base set.

Keys are looked up when you ask for them using a getter and values are
provided based on the following criteria:

1. If `NODE_ENV` is not 'test' use local config value if that key exists.
2. Use key in `NODE_ENV` config if it exists and has been setup in `config/index.js`.
3. Use key in defaults.js

Local overrides are possible unless the `NODE_ENV` environment is test

Adding a new config
-------------------

To add a new config e.g: 'edge' create a new config file in lib/config called 'edge.js'

In it define the keys you want to override. Totally new keys are allowed but you'll get
a warning if it doesn't exist in the defaults conf.

e.g::

    module.exports = {
        showClientConsole: true,
    };

Lastly update lib/config/index.js to add the require the new file adding it to the
overall config object.

e.g::
    config.edge = require('./edge');

.. note::
    If you're adding something that shouldn't be committed to the repo then you'll want a
    try/catch around the require see how the local file is required for an example.
    (Now would be a good time to add it to .gitignore!).

Using the config
----------------

Using the config is just a case of setting the `NODE_ENV` environment var before
starting up the app. E.g::

    NODE_ENV=test nodejs main.js
