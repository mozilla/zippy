Zippy
===================================

*Please note:* this project is currently unmaintained and is not (or soon will not) be in active use by Mozilla.

This is the Mozilla reference implementation of a payment processor that would
hook into a `payment provider for navigator.mozPay()`_ such as `WebPay`_. It is
a reference implementation of `Marketplace payment providers specification`_.

It shows the API,
endpoints, and authorization formats a payment processor should implement
in order to integrate with the `Firefox Marketplace`_ via `WebPay`_
(and `Solitude`_ behind the scenes).
Hooking into WebPay as a payment processor is much simpler than
implementing a full-on payment provider to spec.

These docs are also available as a PDF: https://media.readthedocs.org/pdf/zippypayments/latest/zippypayments.pdf

Zippy provides you with a working example. It's important to note that underneath
Zippy does not actually do anything other
than record some transaction information to allow APIs to work. Specifically it
does not:

* try and actually charge carrier billing
* try and charge a credit card
* process any money at all

That is all faked out. It's up to the individual payment processor to implement
that.

Do I have to use node?
----------------------

**No. You should not take our reference implementation of Zippy and
use it. This is not production code.**

The point of this is not to provide any code that you should run. Instead it is
to **demonstrate and document a common API for payment processors**.

So how should I use Zippy?
~~~~~~~~~~~~~~~~~~~~~~~~~~

Play with it, look at the API. Use it as a sample. Then use whatever
software tools, frameworks and methodologies you use in development and build
your own version of Zippy.

Your implementation should implement the `Marketplace payment providers specification`_.

If you build something that has:

* the same API end points
* uses OAuth for authentication
* takes the same inputs in the same formats (e.g.: REST over HTTP)
* responds with the same outputs (e.g.: REST over HTTP)
* copes with errors in the same way

Then you will have a **zippy compatible** implmentation and all Mozilla has to
do is change the configuration of the Firefox Marketplace and we'll plug into
your implementation of the API.

How do I use the templates?
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The templates are written in to work with the Mozilla Zippy implementation. That
likely won't work for other people, you likely have a different HTML templating
library. We haven't found a good solution for this yet. But Zippy gives you the
HTML, the CSS, the JS and the localisations. That's a pretty good start.

How do I make this better?
~~~~~~~~~~~~~~~~~~~~~~~~~~

This is an open source project, we welcome any and all feedback. We certainly
haven't implemented all the APIs that could possibly exist. We don't know all
the answers. We'd love to work with anyone using Zippy and make this better.

Mailing list: https://lists.mozilla.org/listinfo/dev-marketplace

It is licensed under the Mozilla Public License v2.0 and contributions are more
than welcome.

Source: https://github.com/mozilla/zippy/

Bugs: https://bugzilla.mozilla.org/show_bug.cgi?id=905736

.. _`payment provider for navigator.mozPay()`: https://wiki.mozilla.org/WebAPI/WebPaymentProvider
.. _WebPay: https://github.com/mozilla/webpay
.. _Solitude: https://github.com/mozilla/solitude
.. _`Firefox Marketplace`: https://github.com/mozilla/zamboni
.. _`Marketplace payment providers specification`: http://marketplace-payments-specification.readthedocs.org/

Contents
--------

.. toctree::
   :maxdepth: 3

   install.rst
   using.rst
   l10n.rst
   payment.rst
   config.rst
   tests.rst


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
