| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Make a request to see history. |

#### URL Expired

The URL for this request expired after 30 days.

name

string

required

The new name of the product.

product\_template\_id

int32

The ID of the new product template (product type) for the product.

product\_category\_id

int32

The ID of the new product template for the product.

sku

string

The new sku for the product.

dimension1\_name

string

The new name for dimension 1 of the product.

dimension1\_value

string

The new dimension 1 value for the product.

dimension2\_name

string

The new dimension 2 name for the product.

dimension2\_value

string

The new dimension 2 value for the product.

dimension3\_name

string

The new dimenstion 3 name for the product.

dimension3\_value

string

The new dimension 3 value for the product.

has\_variants

boolean

The new value for whether or not the product has variants.

truefalse

dimension1\_id

int32

The new ID for the product's dimension 1.

dimension2\_id

int32

The new ID for the product's dimension 2.

dimension3\_id

int32

The new ID for the product's dimension 3.

product\_custom\_attributes

array of objects

An array of product custom attribute IDs and values

product\_custom\_attributes
ADD object

# `` 200      200

# `` 400      400

Updated over 2 years ago

* * *

Did this page help you?

Yes

No

ShellNodeRubyPHPPython

```

xxxxxxxxxx

curl --request POST \

     --url https://api.imagerelay.com/api/v2/products \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated over 2 years ago

* * *

Did this page help you?

Yes

No