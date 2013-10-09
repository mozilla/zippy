# Welcome to **Zippy**: a reference implementation for payment providers for the Firefox Marketplace.

This is an example of what you have to implement from a payment provider side in order to integrate easily with the [Firefox Marketplace](http://marketplace.mozilla.org/). This reference implementation uses JavaScript/Nodejs but you're free to use whatever language/framework you want to achieve this.

## Concepts & URLs

First, you'll have to deal with a **Seller** object, you can retrieve and create one with those URLs and parameters:

* [/sellers/](/sellers/): `GET`, `POST` (parameters: `uuid`)
* [/sellers/{uuid}/](/sellers/{uuid}/): `GET`

*Note: the documentation uses [URL Templates](https://en.wikipedia.org/wiki/URL_Template) to include dynamic parameters. You can follow those links to get additional information about a particular URL.*

## Authentication


## Errors


## Caching
