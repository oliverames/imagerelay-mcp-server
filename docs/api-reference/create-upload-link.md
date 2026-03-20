| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

purpose

string

required

The purpose for the new upload link. It can be anything.

folder\_id

int32

required

The ID of the folder for which a upload link will be created.

expires\_on

date

The date that the upload link should expire.

# `` 201      201

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

     --url https://api.imagerelay.com/api/v2/upload_links \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``201 - Result``400 - Result

Updated over 2 years ago

* * *

Did this page help you?

Yes

No