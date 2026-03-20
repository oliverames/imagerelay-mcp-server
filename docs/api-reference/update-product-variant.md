#### URL Expired

The URL for this request expired after 30 days.

product\_id

int32

required

The ID of the variant's product

variant\_id

int32

required

The ID of the variant to update

name

string

required

Variant name

variant\_dimension\_options

array of objects

required

Variant Dimension Option(s) to update

variant\_dimension\_options\*
ADD object

product\_custom\_attributes

array of objects

Product Custom Attribute(s) to update

product\_custom\_attributes
ADD object

# `` 200      200

# `` 400      400

Updated 3 months ago

* * *

Did this page help you?

Yes

No

ShellNodeRubyPHPPython

```

xxxxxxxxxx

curl --request PATCH \

     --url https://api.imagerelay.com/api/v2/products/product_id/variants/variant_id \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated 3 months ago

* * *

Did this page help you?

Yes

No