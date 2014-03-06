Installation
============

This section is for developers who wish to make enhancements to Zippy or just to
try the code out in a development environment.

Installing Zippy
----------------

You need `NodeJS`_ 0.10.5 or greater.
The Zippy source includes all dependencies but you need
to build some compiled code for your local architecture.
Run this to build everything::

    npm rebuild

For convenience, you may want to give all local node scripts
priority on your path, like this::

    export PATH="./node_modules/.bin/:${PATH}"

During development, you'll also want to install grunt-cli globally::

    npm install -g grunt-cli

This will put the grunt command in your system path, allowing it to be run from any directory.

.. note::

    Installing grunt-cli does not install the Grunt task runner! The job of the Grunt CLI is
    simple: run the version of Grunt which has been installed next to a Gruntfile. This allows
    multiple versions of Grunt to be installed on the same machine simultaneously.

Create a local config file and fill in some values like ``signatureKeys``::

    cp lib/config/local-dist.js lib/config/local.js

To start a development server type this::

    grunt start

You can then browse the site at http://0.0.0.0:8080 (use the ``--noauth`` option
in case you don't want to pass OAuth headers at each request).

If you want to change the port run::

    grunt start --port=9999


`grunt start` runs both the local server and watchs for changes. At the moment this auto runs:

 * stylus
 * jshint

See :ref:`testing` for instructions on how to run tests.

Building docs
-------------

Unlike the site itself, the documentation system uses Python and `Sphinx`_.
To build the documentation from source create a `virtualenv`_ then install
the requirements with `pip`_::

    pip install -r docs/requirements.txt

Build the docs like this::

    grunt docs

Browse the docs from ``docs/_build/html/index.html``.


Updating Bower resources
------------------------

`Bower`_ is a package manager for the web. All it does is pull in versioned client deps into
a `bower_components` dir.

It's very similar to npm. So a `bower.json`_ should seem very familiar to you if you've
used a package.json for npm.

Bower manages our third party libs for the client. If you want to update those libs
first update `bower.json`_ with the new libs you want to use.

Next if you've added a new client-side dep. You need to update some config. Because most bower
package authors don't yet use the ignore feature, we're using `grunt-bower-task`_ to copy
the necessary files under `media/lib`. This saves us having to server a ton of tests and other cruft
above and beyond the lib files.

If you want to customise how that works then see the `exportsOverride` in the `bower.json`_. This
points at the files by type (e.g JS or CSS) so that only the referenced files will end
up in the lib dir.

To see the general configuration take a look at how `grunt-bower-task`_ is configured in
`Gruntfile.js`_.

If you need additional guidance the `grunt-bower-task`_ docs should have what you need.

Once the configuration is complete running `grunt bower:install` should copy the new lib files into
`media/lib`.

Next. You can update the requirejs config in `media/js/main.js` if you're using JS in order
to be able to reference the files in other scripts.


Sample server
-------------

A sample zippy server is running at https://zippy.paas.allizom.org, that you
are free to use. There are no guarantees on uptime, this is not a production
server.


.. _Gruntfile.js: https://github.com/mozilla/zippy/blob/master/Gruntfile.js
.. _Bower: http://bower.io/
.. _bower.json: https://github.com/mozilla/zippy/blob/master/bower.json
.. _grunt-bower-task: https://github.com/yatskevich/grunt-bower-task
.. _NodeJS: http://nodejs.org/
.. _Sphinx: http://sphinx-doc.org/
.. _virtualenv: https://pypi.python.org/pypi/virtualenv
.. _pip: http://www.pip-installer.org/
