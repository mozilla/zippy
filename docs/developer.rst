.. _developer-label:

Developers
==========

This covers registering setting up a seller (who is normally an app developer)
and registering their products with the payment provider.

Note that in the following examples ``{*uuid}`` refers to an actual ``uuid``.

.. note::

    Sellers and products both return list of JSON elements which is bad from
    a security perspective because it can be subject to `JSON Hijacking`_.
    In case of a real JavaScript implementation, you must `use prefixes`_
    to prevent that.

.. _`JSON Hijacking`: http://haacked.com/archive/2009/06/25/json-hijacking.aspx/
.. _`use prefixes`: https://stackoverflow.com/questions/2669690/why-does-google-prepend-while1-to-their-json-responses

.. _sellers:

Sellers
-------

This API allows you to get/create sellers who can offer products for sale.

This API demonstrates a very simple get and post API for creating a seller.
Typically a payment provider will require more information about a seller that
is shown here, since the payment provider will likely want more information
pertinent to developer payouts.

.. http:get:: /sellers

    **Response**

    You get a list of all sellers. For example:

    .. code-block:: json

        [
          {
            "status": "ACTIVE",
            "name": "John",
            "email": "jdoe@example.org",
            "resource_pk": "{seller-uuid}",
            "resource_name": "sellers",
            "resource_uri": "/sellers/{seller-uuid}",
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
          "status": "ACTIVE",
          "name": "John",
          "email": "jdoe@example.org",
          "resource_pk": "{seller-uuid}",
          "resource_name": "sellers",
          "resource_uri": "/sellers/{seller-uuid}",
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
          "status": "ACTIVE",
          "name": "John",
          "email": "jdoe@example.org",
          "resource_pk": "{seller-uuid}",
          "resource_name": "sellers",
          "resource_uri": "/sellers/{seller-uuid}",
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

.. _terms:

Terms
-----

Once the terms have been approved, they can be set on the seller.

.. http:get:: /terms/:uuid

    **Response**

    You get terms related to a seller object matching ``:uuid``. For example:

    .. code-block:: json

        {
          "terms": "Terms for seller: John",
          "agreement": "2013-11-19T11:48:49.158Z"
        }

    :status 200: success.

.. _products:

Products
--------

This API allows you to get/create products that can be purchased. It is
required that a developer can register multiple products with the payment
provider.

.. http:get:: /products

    **Request**

    :param external_id:
        Filter all products by this external identifier.
        Since this is only unique per seller, filtering by
        seller is probably a good idea.

    :param seller_id:
        Filter all products by this seller UUID, the
        primary key for the :ref:`seller <sellers>` who owns each product.

    **Response**

    A list of products matching your query. For example:

    .. code-block:: json

        [
          {
            "uuid": "{product-uuid}",
            "external_id": "{product-external-uuid}",
            "seller_id": "{seller-uuid}",
            "active": true,
            "name": "Magical Unicorn",
            "resource_pk": "{product-uuid}",
            "resource_name": "products",
            "resource_uri": "/products/{product-uuid}"
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

    :param uuid:
        A unique ID for the product.

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
          "uuid": "{product-uuid}",
          "external_id": "{product-external-uuid}",
          "seller_id": "{seller-uuid}",
          "active": true,
          "name": "Magical Unicorn",
          "resource_pk": "{product-uuid}",
          "resource_name": "products",
          "resource_uri": "/products/{product-uuid}"
        }

    In case of an error:

    .. code-block:: json

        {
          "code": "InvalidArgument",
          "message": {
            "external_id": "external_id must be unique",
            "seller_id": "zero results for seller_id {wrong-uuid}"
          }
        }

    :status 201: success.
    :status 409: conflict.

.. http:get:: /products/:uuid

    **Response**

    You get a product object matching ``:uuid``. For example:

    .. code-block:: json

        {
          "uuid": "{product-uuid}",
          "external_id": "{product-external-uuid}",
          "seller_id": "{seller-uuid}",
          "active": true,
          "name": "Magical Unicorn",
          "resource_pk": "{product-uuid}",
          "resource_name": "products",
          "resource_uri": "/products/{product-uuid}"
        }

    :status 200: success.

