.. _developer-label:

Developer
=========

This covers registering a developer and their apps with the payment provider.

.. _products:

Products
--------

This API allows you to get/create products that can be purchased.

.. http:get:: /products

    **Request**

    :param external_id:
        Filter all products by this external identifier.
        Since this is only unique per seller, filtering by
        seller is probably a good idea.

    :param seller_id:
        Filter all products by this seller ID, the
        primary key for the :ref:`seller <sellers>` who owns each product.

    :param seller_uuid:
        Filter all products by this seller UUID, the
        unique identifier for the :ref:`seller <sellers>` who owns each
        product.

    **Response**

    A list of products matching your query. For example:

    .. code-block:: json

        [
          {
            "external_id": "...",
            "seller_id": ...,
            "active": true,
            "name": "Magical Unicorn",
            "resource_pk": "1",
            "resource_name": "products",
            "resource_uri": "/products/1"
          }, {
          ...
          }
        ]

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": "some error"
        }

    :status 200: success.
    :status 404: resource not found.
    :status 409: conflict.

.. http:post:: /products

    **Request**

    :param external_id:
        An external identifier for the product.
        This must be unique per seller but doesn't need to be unique
        across the entire system.

    :param name:
        A name to describe the product.

    :param seller_id:
        Primary key of :ref:`seller <sellers>` who owns this product.

    **Response**

    The created product is returned to you. For example:

    .. code-block:: json

        {
          "external_id": "...",
          "seller_id": ...,
          "active": true,
          "name": "Magical Unicorn",
          "resource_pk": "1",
          "resource_name": "products",
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
            "resource_name": "sellers",
            "resource_uri": "/sellers/1",
            "agreement": ""
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
          "resource_name": "sellers",
          "resource_uri": "/sellers/1",
          "agreement": ""
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

    :param agreement:
        An optional date that can be used for terms validation. The responsibility
        to use that date as a validation/expiration is left to the client.

    **Response**

    The created seller is returned to you. For example:

    .. code-block:: json

        {
          "uuid": "...",
          "status": "ACTIVE",
          "name": "John",
          "email": "jdoe@example.org",
          "resource_pk": "1",
          "resource_name": "sellers",
          "resource_uri": "/sellers/1",
          "agreement": ""
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": "UUID must be supplied."
        }

    :status 201: success.
    :status 409: conflict.

.. http:get:: /terms/:uuid

    **Response**

    You get terms related to a seller object matching ``:uuid``. For example:

    .. code-block:: json

        {
          "terms": "Terms for seller: John",
          "agreement": "2013-11-19T11:48:49.158Z"
        }

    :status 200: success.
