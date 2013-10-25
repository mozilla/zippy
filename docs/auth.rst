Authentication
==============

How authentication works.

.. image:: diagrams/auth-flow.png

The authentication uses `OAuth 1.0a <http://oauth.net/core/1.0a/>`_ with
the 0-legged scenario, the client of the API has to know 4 settings
prior to performing a request:

 * the ``consumer key``
 * the ``consumer secret``
 * the ``token key``
 * the ``token secret``

Each of these parameters are 16 chars long strings delivered by the
implementor of Zippy. You have to pass those parameters and the regular
OAuth signature of parameters within the ``Authorization`` header to be
able to perform a request. Here is an example of the full header
(splited across multiple lines for lisibility but must be kept as a
one-liner header)::

    OAuth realm="Zippy",oauth_signature="siwj6XR109/Dqg4ErMnuw9hLA/M=",
    oauth_consumer_key="dpf43f3p2l4k3l03",oauth_nonce="notimplemented",
    oauth_signature_method="HMAC-SHA1",oauth_timestamp="notimplemented",
    oauth_token="nnch734d00sl2jdk",oauth_version="1.0"

Given the 0-legged scenario, the user is not involved in this workflow,
that's why you don't have to deal with the classic OAuth authentication
token.
