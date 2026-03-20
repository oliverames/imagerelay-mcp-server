#### URL Expired

The URL for this request expired after 30 days.

product\_id

int32

required

The ID of the product to receive the new variant

name

string

Name of the new variant

variant\_dimension\_options

array of objects

An array of variant option IDs and values

variant\_dimension\_options
ADD object

product\_custom\_attributes

array of objects

An array of product custom attribute IDs and values

product\_custom\_attributes
ADD object

# `` 200      200

# `` 400      400

Updated over 2 years ago

* * *

ShellNodeRubyPHPPython

```

xxxxxxxxxx

curl --request POST \

     --url https://api.imagerelay.com/api/v2/products/%20product_id%20/variants \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated over 2 years ago

* * *