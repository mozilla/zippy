.. _testing:

Testing
=======

Automated tests
---------------

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

