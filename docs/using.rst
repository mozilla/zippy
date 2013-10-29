.. _using-label:

Using
=====

Zippy has a JSON-based REST API to programmatically interact with the payment
system.

To ensure you retrieve results in JSON format, make sure to add an
accept header of ``application/json`` to all API requests. For example::

    curl -H "Accept: application/json" -X POST ...

Errors
------

TODO: How errors are displayed and handled.
