# Seller

The [seller](http://zippypayments.readthedocs.org/en/latest/developer.html#sellers) object is required to initiate a payment.

* a `GET` request returns a unique element ;
* a `PUT` request updates an element and returns it ;
* a `DELETE` request deletes it without any confirmation.

You can retrieve terms associated to a seller by reaching `/terms/{uuid}`.
