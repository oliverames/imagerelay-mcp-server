| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

fild\_id

int32

required

The ID of the file to duplicate.

folder\_id

string

required

The ID of the folder to which the file will be added.

should\_copy\_metadata

boolean

required

If true, all metadata, tags/keywords, and IPTC fields will be copied to the new file. If false, the copied file will get the destination folder's default file type.

truefalse

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

     --url https://api.imagerelay.com/api/v2/files/file_id/dupicate \

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