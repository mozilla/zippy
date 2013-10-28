========
REST API
========

Zippy has a JSON-based REST API to programmatically interact with the payment
system.

To ensure you retrieve results in JSON format, make sure to add an
accept header of ``application/json`` to all API requests. For example::

    curl -H "Accept: application/json" -X POST ...


.. _products:

Products
========

This API allows you to get/create products that can be purchased.

.. http:get:: /products/

    TODO

.. http:post:: /products/

    **Request**

    :param external_id:
        A unique ID for the product.

    :param seller_id:
        Primary key of :ref:`seller <sellers>` who owns this product.

    **Response**

    The created product is returned to you. For example:

    .. code-block:: json

        {
          "external_id": "...",
          "seller_id": ...,
          "active": true,
          "resource_pk": "1",
          "resource_uri": "/products/1"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": {
            "external_id": "external_id must be unique",
            "seller_id":"zero results for seller_id 2"
          }
        }

    :status 201: success.
    :status 409: conflict.


.. _sellers:

Sellers
=======

This API allows you to get/create sellers who can offer products for sale.

.. http:get:: /sellers/

    **Response**

    You get a list of all sellers. For example:

    .. code-block:: json

        [
          {
            "uuid": "...",
            "active": true,
            "resource_pk": "1",
            "resource_uri": "/seller/1"
          },
          ...
        ]

    :status 200: success.

.. http:get:: /sellers/:uuid/

    **Response**

    You get a seller object matching ``:uuid``. For example:

    .. code-block:: json

        {
          "uuid": "...",
          "active": true,
          "resource_pk": "1",
          "resource_uri": "/seller/1"
       }

    :status 200: success.

.. http:post:: /sellers/

    **Request**

    :param uuid:
        A unique ID for the seller.

    **Response**

    The created seller is returned to you. For example:

    .. code-block:: json

        {
          "uuid": "...",
          "active": true,
          "resource_pk": "1",
          "resource_uri": "/seller/1"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": "UUID must be supplied."
        }

    :status 201: success.
    :status 409: conflict.


.. _transactions:

Transactions
============

This API enables you to begin a transaction so that a product can be purchased.

.. http:get:: /transactions/

    TODO

.. http:post:: /transactions/

    **Request**

    :param price:
        Decimal amount of the purchase price. Example: ``0.99``.

    :param currency:
        ISO currency code for the purchase price. Examples: ``EUR``, ``USD``.

    :param carrier:
        Mobile carrier that the user is on when making a purchase.
        Example: ``TMOBILE``.

    :param region:
        Numeric MCC (Mobile Country Code) of the region that the user is in
        when beginning the transaction. Example: ``300``.

    :param pay_method:
        Method of payment requested. Possible values:

        ``CARD``
            Credit card.
        ``OPERATOR``
            Mobile operator billing.

    :param product_id:
        Primary key of :ref:`product <products>` about to be purchased.

    **Response**

    The created transaction is returned to you with a few extra fields.

    :param status:
        The status of the transaction.

    :param token:
        Unique token that can be used to address this transaction.

    For example:

    .. code-block:: json

        {
          "status": "started",
          "token": "f74b2b68ad5cce2c07b14e06ed67b76e56ab91196bac605...",
          "price":"0.89",
          "currency":"EUR",
          "pay_method": "OPERATOR",
          "carrier": "TMOBILE",
          "region": 300,
          "product_id": 1,
          "resource_pk": "1",
          "resource_uri": "/transactions/1"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": {
            "product_id": "This field is required."
          }
        }

    :status 201: success.
    :status 409: conflict.

Notices
=======

If a Zippy server send you a notice, this API allows you to cryptographically
verify that Zippy really sent you that notice.


.. http:post:: /notices/

    **Request**

    :param qs:
        In some cases Zippy may redirect to a URL on your server.
        This parameter is the complete query string (after the '?') that Zippy sent to you.
        Example: ``result=success&transaction_id=123&sig=0:1bcde2f3fccdd...``

    **Response**

    If the signature of the notice is correct you can trust that all values in
    the query string were sent to you by the Zippy service.

    :param result:
        Result of the signature check. Possible values: ``OK``, ``FAIL``.

    :param reason:
        In the case of a failure, this is the reason why.

    A successful signature check results in this:

    .. code-block:: json

        {
          "result": "OK",
        }

    A failed signature check looks like this (this is a 200 response):

    .. code-block:: json

        {
          "result": "FAIL",
          "reason": "signature mismatch"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": {
            "qs": "This field is required."
          }
        }

    :status 200: success.
    :status 409: conflict.
