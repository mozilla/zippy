============
Installation
============

This section is for developers who wish to make enhancements to Zippy or just to
try the code out in a development environment.

Installing Zippy
================

You need `NodeJS`_ 0.10.5 or greater.
From the source directory, install all the node
packages like this::

    npm install

You'll also want to install grunt-cli globally::

    npm install -g grunt-cli

This will put the grunt command in your system path, allowing it to be run from any directory.

.. note::

    Installing grunt-cli does not install the Grunt task runner! The job of the Grunt CLI is
    simple: run the version of Grunt which has been installed next to a Gruntfile. This allows
    multiple versions of Grunt to be installed on the same machine simultaneously.

Create a local config file and fill in some values like ``signatureKeys``::

    cp lib/config/local-dist.js lib/config/local.js

To start a development server type this::

    grunt server

You can then browse the site at http://0.0.0.0:8080

If you want to change the port run::

    grunt server --port=9999

If you're developing then you'll probably also want grunt to look after re-building css
and linting js as you go.
To do that run::

    grunt start

.. note::

    This just wraps up `grunt server watch` in a single convenient command and runs stylus so
    that if you don't have the css already generated it gets built for you.

This will run both the local server and watch for changes. At the moment this auto runs:

 * stylus
 * jshint

See :ref:`testing` for instructions on how to run tests.

Building docs
=============

Unlike the site itself, the documentation system uses Python and `Sphinx`_.
To build the documentation from source create a `virtualenv`_ then install
the requirements with `pip`_::

    pip install -r docs/requirements.txt

Build the docs like this::

    make -C docs html

Browse the docs from ``docs/_build/html/index.html``.

.. _NodeJS: http://nodejs.org/
.. _Sphinx: http://sphinx-doc.org/
.. _virtualenv: https://pypi.python.org/pypi/virtualenv
.. _pip: http://www.pip-installer.org/
