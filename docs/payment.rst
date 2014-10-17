.. _payment-label:

Payment
=======

When processing the payment, Zippy simulates charging money for digital goods.
When finished, it redirects to the
payment provider (such as `WebPay`_) and sends a post notification. Please see
the specification for a diagram of the flow. Exactly what will happen here depends upon the
payment processor and the configuration.
After these steps have been completed, Zippy will return to the success or error
URL. See the :ref:`redirect-api` for details.

A real payment processor would probably do things like this:

* Authentication: set up a user for billing, perhaps with
  SMS authentication.
* Direct billing: place a charge on a user's mobile bill.
* Credit card billing.

.. _redirect-api:

How Redirects Work
------------------

When Zippy completes a transaction it redirects to the original success or
error URL (see :ref:`transactions` API for how those are defined).
In the case of success, the application that began payment would respond with
the HTML/CSS/JS needed to dispurse the goods.

A few query string parameters are added to the URL that you can use to
reconcile the payment.

**ext_transaction_id**
    This is the original (external) transaction ID that was submitted to the
    :ref:`transaction <transactions>` API as ``ext_transaction_id``.

**error**
    For error redirects only, this string will indicate the type of error.
    Example: ``CC_ERROR``. Note: it's up to each payment processor to
    define their own error codes.

Example: ``https://site/payments/success/?ext_transaction_id=XYZ``

.. note::

   A signed query string notice must be :ref:`verified <notice-api>` before any of
   the values can be trusted.

How Post Notifications Work
---------------------------

When Zippy completes a transaction it not only redirects to the success/error
URL, it also sends a post notification in the background. There are some edge
cases in web user agents that could interrupt a redirect request so post
notifications are generally more reliable. An application processing a payment
should expect to continue the payment flow after redirect but should use post
notifications as an additional measure to reconcile payment results.

An application configures its callback URLs when beginning a
:ref:`transaction <transactions>`. Zippy will post a single parameter called
``signed_notice`` to either the callback success or error URL.
This parameter contains a URL-encoded, signed notice that must be
:ref:`verified <notice-api>` and
then URL-decoded.

The notice query string has the same parameters as the one sent in a
:ref:`redirect <redirect-api>`.

Style guide
~~~~~~~~~~~

Zippy contains a full style guide containing the CSS, HTML and JS to be used on
a page. It will also contain localisations.

If a page has been implemented in zippy, then it can be used by a payment
provider by copying and pasting over the code into the existing payment
providers framework. It might be worth payment providers thinking about this
step as it creates a bit of a long term maintenance issue.

The style guide is accessible in your zippy checkout, or here:

http://zippy.paas.allizom.org/styleguide

Translations
------------

All the pages are translated. For a status of the translations see:

https://localize.mozilla.org/projects/zippy

The translations are available in the zippy repository:

https://github.com/mozilla/zippy/tree/master/locale

.. _WebPay: https://github.com/mozilla/webpay
