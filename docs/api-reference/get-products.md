| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

name

string

Retrieve products with the matching name value.

with\_variant

int32

Retrieve products that are associated with the specified product template ID see: /api/v2/product\_templates.json to retrieve all product templates and their corresponding ID

with\_variants

boolean

Retrieve products that either have variants enabled, or do not have variants enabled.

truefalse

with\_variant\_dimension\_id

int32

Retrieve products that have variants enabled and have the specified dimension\_id associated with their product see: /api/v2/product\_dimensions to retrieve all product dimensions and their corresponding ID

in\_category

int32

Retrieve products that have been assigned the specified category ID see: /api/v2/product\_categories to retrieve all product categories and their corresponding ID

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

curl --request GET \

     --url https://api.imagerelay.com/api/v2/products \

     --header 'accept: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated over 2 years ago

* * *

Did this page help you?

Yes

No