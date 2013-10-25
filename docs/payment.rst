.. _payment-label:

Payment
=======

TODO

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
