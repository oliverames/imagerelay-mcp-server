| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

First, split your file into chunks. Chunk size is up to you but must be 5 MB or less. If you attempt to upload a chunk larger than 5 MB you'll receive an error. The last number is the chunk number. This is used, to determine the order to reassemble the chunks on the server. So the second chunk would be `POST /api/v2/files/{file_id}/versions/{v4_uuid}/chunk/2`. The request body should be the binary data of the chunk. Make sure to set the Content-Length header.

file\_id

int32

required

The ID of the file to which the version will be added.

v4\_uuid

string

required

The v4 uuid obtained from the versions endpoint.

chunk\_number

int32

required

The number of the chunk. The chunks are reassembled in order of chunk number.

Content-Type

string

Defaults to application/octet-stream

Should be `application/octet-stream` for uploading chunks

accept

string

enum

Defaults to application/json

Generated from available response content types

application/jsontext/plain

Allowed:

`application/json``text/plain`

# `` 204      204

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

     --url https://api.imagerelay.com/api/v2/files/file_id/versions/v4_uuid/chunk/chunk_number \

     --header 'accept: text/plain'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``400 - Result

Updated over 2 years ago

* * *

Did this page help you?

Yes

No