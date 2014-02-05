Zippy
===================================

This is a reference implementation of a payment processor that would hook into a
`payment provider for navigator.mozPay()`_ such as `WebPay`_.
It shows the API,
endpoints, and authorization formats a payment processor should implement
in order to integrate with the `Firefox Marketplace`_ via `WebPay`_
(and `Solitude`_ behind the scenes).
Hooking into WebPay as a payment processor is much simpler than
implementing a full-on payment provider to spec.

These docs are also available as a PDF: https://media.readthedocs.org/pdf/zippypayments/latest/zippypayments.pdf

Rather than being a specification to read, Zippy is a working project. It's
important to note that underneath Zippy does not actually do anything other
than record some transaction information to allow APIs to work. Specifically it
does not:

* try and actually charge carrier billing
* try and charge a credit card
* process any money at all

That is all faked out. It's up to the individual payment processor to implement
that.

**You should not** take zippy and just stick payment processing
into it. We did not write this with production code in mind, it hasn't gone
through security or performance checks.

Are you interested in how *everything* works? Read about the :ref:`flow`.

Here's how Zippy fits into the `Firefox Marketplace`_ infrastructure.

.. image:: diagrams/architecture.png

It is licensed under the Mozilla Public License v2.0 and contributions are more
than welcome.

Source: https://github.com/mozilla/zippy/

Bugs: https://bugzilla.mozilla.org/show_bug.cgi?id=905736

Mailing list: https://lists.mozilla.org/listinfo/dev-marketplace

.. _`payment provider for navigator.mozPay()`: https://wiki.mozilla.org/WebAPI/WebPaymentProvider
.. _WebPay: https://github.com/mozilla/webpay
.. _Solitude: https://github.com/mozilla/solitude
.. _`Firefox Marketplace`: https://github.com/mozilla/zamboni

Using Zippy
-----------

Everything you need to know about data formats, protocols, authentication and
the like. See the :ref:`using zippy documentation <using-label>`.

Sellers
~~~~~~~

In Zippy, **sellers** are the **developers** who are wanting to place something
for sale on the app market. They will need to create an account with the
payment provider:

* Setting up a developer account so that a developer can recieve payment.
* Registering one or more products with the payment provider.
* Any further configuration that the product needs.
* Confirming that data is all set up correctly.

See the :ref:`developer documentation <developer-label>`.

Payment
~~~~~~~

* The actual payment part of the :ref:`flow <flow>`.
* Starting the payment :ref:`flow <flow>`.
* Pages that should be shown and hosted by the payment provider.
* The result after the payment has been completed.

See the :ref:`payment documentation <payment-label>`.

Reporting
~~~~~~~~~

* Reporting of transactions back to developers.

See the :ref:`reporting documentation <reporting-label>` documentation.

Miscellaneous
~~~~~~~~~~~~~

* Refunds and chargebacks, see :ref:`refunds <refunds-label>`
* Token checking and other security, see :ref:`security <security-label>`
* Status, see :ref:`status <status-label>`

Contents
--------

.. toctree::
   :maxdepth: 3

   install.rst
   using.rst
   developer.rst
   l10n.rst
   payment.rst
   reporting.rst
   refunds.rst
   security.rst
   miscellaneous.rst
   tests.rst
   flow.rst
   faq.rst


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
