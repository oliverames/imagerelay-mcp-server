| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

Synced Files let you have the exact same file in multiple folders. When you make a change to any Synced File, that change applies to all instances of the Synced File.

file\_id

int32

required

The ID of the file to create a synced file from.

folder\_ids

array of strings

required

The IDs of the folders to add the synced file to.

folder\_ids\*
ADD string

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

     --url https://api.imagerelay.com/api/v2/file_id/synced_file \

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