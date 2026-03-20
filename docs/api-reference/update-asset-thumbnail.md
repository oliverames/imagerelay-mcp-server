| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

file\_id

int32

required

The ID of the file whose assest will be updated.

file\_name

string

required

The filename for the new assest thumbnail including a file extension.

RAW\_BODY

file

required

The binary image data for the new asset thumbnail.

Content-Type

string

required

Defaults to application/octet-stream

The value _application/octet-stream_ is required when updating asset thumbnails.

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

     --url https://api.imagerelay.com/api/v2/files/file_id/thumbnail \

     --header 'Content-Type: application/octet-stream' \

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