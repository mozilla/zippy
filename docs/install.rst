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

To start a development server type this::

    npm start

You can then browse the site at http://0.0.0.0:8080

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
