.. _testing:

Testing
=======

Running Automated tests
-----------------------

To start the tests run::

    grunt test

This will run both jshint and nodeunit.

To test just one suite::

    grunt test --testsuite products

This will only launch tests from the file `suite/products.test.js`.

To test just one test from the suite::

    grunt test --testsuite products --test postOk

This will also run all tests that match::

    grunt test --test postOk


Automated UI tests via Casperjs
-------------------------------

Zippy has a test suite that  runs tests against the web UI in a headless browser.
To run UI tests you need `casperjs`_ 1.1 or greater. With `homebrew`_ on
Mac OS X you can install it like this::

    brew install --devel casperjs

From the root of Webpay and within your Python virualenv,
run the tests like this::

    grunt uitest

To hack on tests, add a file like ``uitest/suite/test.*.js``.
All JS files in that directory are run automatically.

