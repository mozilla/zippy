Miscellaneous
=============

APIs not covered in the other documentation.

.. _status-label:

Status
------

This API allows you to report server status back to the client. The Marketplace
will hit this regularly to ensure that the service is up and responding.

.. http:get:: /status/

    **Response**

    .. code-block:: json

        {
            "status": "OK"
        }

    :status 200: success.

Any none 200 status returned by the server will be assumed to be a service
interruption.
