.. _using-label:

Using
=====

Zippy has a JSON-based HTTP API to programmatically interact with the payment
system.

To ensure you retrieve results in JSON format, make sure to add an
accept header of ``application/json`` to all API requests. For example::

    curl -H "Accept: application/json" -X POST ...

Authentication
--------------

Zippy requires authentication on all requests. To make development and testing
with the zippy reference implementation, it can be run without authentication,
but this should never occur in production.

The authentication uses `OAuth 1.0a <http://oauth.net/core/1.0a/>`_
(`IETF specification <http://tools.ietf.org/html/rfc5849>`_)
with the 0-legged scenario, the client of the API has to know 2 settings
prior to performing a request:

 * the ``consumer key``
 * the ``consumer secret``

Each of these parameters are 16 chars long strings delivered by the
implementor of Zippy. You have to pass those parameters and the regular
OAuth signature of parameters within the ``Authorization`` header to be
able to perform a request. Here is an example of the full header
(splited across multiple lines for lisibility but must be kept as a
one-liner header)::

    OAuth realm="Zippy",oauth_signature="wpMJyt18lPuVIzymgL4WHHVao7A=",
    oauth_consumer_key="dpf43f3p2l4k3l03",oauth_nonce="notimplemented",
    oauth_signature_method="HMAC-SHA1",oauth_timestamp="notimplemented",
    oauth_token="notimplemented",oauth_version="1.0"

Given the 0-legged scenario, the user is not involved in this workflow,
that's why you don't have to deal with the classic OAuth authentication
token.

Errors
------

TODO: How errors are displayed and handled.
