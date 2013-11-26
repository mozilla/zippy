.. _payment-label:

Payment
=======

.. _transactions:

Transactions
------------

This API enables you to begin a transaction so that a product can be purchased.

.. http:get:: /transactions

    TODO

.. http:post:: /transactions

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

    :param callback_url:
        URL to POST against with signed parameters once the payment is
        accepted.

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
          "resource_uri": "/transactions/1/"
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


Credit card or carrier billing choice
-------------------------------------

Current
~~~~~~~

TODO

Legacy
~~~~~~

.. note:: existing in production with Bango as of Nov 2013.

Currently when a user lands on the buy page, the user has to choose between
using carrier billing or a credit card. This diagram outlines the choices.

.. image:: diagrams/buy-flow.png

Carrier Authentication
----------------------

Current
~~~~~~~

Legacy
~~~~~~

.. note:: existing in production as of Nov 2013.

This is a basic flow for how carrier authentication works.

It's expected that the implementor of the payment flow would implement a flow
that looks like this to start the payment flow.

.. image:: diagrams/auth-flow.png
