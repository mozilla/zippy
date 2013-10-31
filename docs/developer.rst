.. _developer-label:

Developer
=========

This covers registering a developer and their apps with the payment provider.

.. _products:

Products
--------

This API allows you to get/create products that can be purchased.

.. http:get:: /products

    TODO

.. http:post:: /products

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
          "resource_uri": "/products/1/"
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
-------

This API allows you to get/create sellers who can offer products for sale.

.. http:get:: /sellers

    **Response**

    You get a list of all sellers. For example:

    .. code-block:: json

        [
          {
            "uuid": "...",
            "status": "ACTIVE",
            "name": "John",
            "email": "jdoe@example.org",
            "resource_pk": "1",
            "resource_uri": "/seller/1/"
          },
          ...
        ]

    :status 200: success.

.. http:get:: /sellers/:uuid

    **Response**

    You get a seller object matching ``:uuid``. For example:

    .. code-block:: json

        {
          "uuid": "...",
          "status": "ACTIVE",
          "name": "John",
          "email": "jdoe@example.org",
          "resource_pk": "1",
          "resource_uri": "/seller/1/"
       }

    :status 200: success.

.. http:post:: /sellers

    **Request**

    :param uuid:
        A unique ID for the seller.

    :param status:
        A status for the seller. Possible values:

        ``ACTIVE``
            Activated seller.

        ``INACTIVE``
            Inactived seller.

        ``DISABLED``
            Deactivated seller.

    :param name:
        A name for the seller.

    :param email:
        An email for the seller.

    **Response**

    The created seller is returned to you. For example:

    .. code-block:: json

        {
          "uuid": "...",
          "status": "ACTIVE",
          "name": "John",
          "email": "jdoe@example.org",
          "resource_pk": "1",
          "resource_uri": "/seller/1/"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": "UUID must be supplied."
        }

    :status 201: success.
    :status 409: conflict.
