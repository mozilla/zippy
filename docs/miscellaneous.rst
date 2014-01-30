.. _miscellaneous:

Miscellaneous
=============

APIs not covered in the other documentation.

.. _status-label:

Status
------

This API allows you to report server status back to the client. The Marketplace
will hit this regularly to ensure that the service is up and responding.

.. http:get:: /status

    **Response**

    .. code-block:: json

        {
            "result": "OK"
        }

    :status 200: success.

Any non-200 status returned by the server will be assumed to be a service
interruption.


Reset user
----------

This API allows you to reset the user in case the Marketplace detects user
switching. This is a dummy implementation, it is left to the payment processor.

.. http:get:: /users/reset

    **Response**

    .. code-block:: json

        {
            "result": "OK"
        }

    :status 200: success.

Any non-200 status returned by the server will be assumed to be a reset
failure.

