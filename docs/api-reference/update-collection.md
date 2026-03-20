| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

collection\_id

int32

required

The ID of the collection to update.

name

string

required

The name of the new collection.

asset\_ids

string

A comma separated list of IDs of assets/files to be added to the new collection.

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

curl --request PUT \

     --url https://api.imagerelay.com/api/v2/collections/collection_id \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result

Updated over 2 years ago

* * *

Did this page help you?

Yes

No