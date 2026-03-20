| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

- First, split your file into chunks. Chunk size is up to you but must be 5 MB or less. If you attempt to upload a chunk larger than 5 MB you'll receive an error. The last number is the chunk number. This is used, to determine the order to reassemble the chunks on the server. So the first chunk would be `POST /api/v2//upload_jobs/{upload_id}/files/{upload_file_id}/chunks/1`
- The request body should be the binary data of the chunk.
  - Content-Type should be data/binary
  - Content-Length header should match the length of the post body (in bytes)

POST requests to the chunk endpoint will return the following response codes:

- `201` \- File upload chunk processed successfully and the file upload is complete.
- `204` \- File upload chunk processed successfully, waiting for more file chunks for the complete file upload.
- `422` \- File upload chunk failed, please ensure your file chunk is 5MB or less and retry.

Once all files for an upload job have been uploaded, an asset will be created automatically on Image Relay.

upload\_id

int32

required

The `upload_id` returned from [this](https://image-relay-api.readme.io/reference/create-upload-job) endpoint.

upload\_file\_id

int32

required

The `files.id` returned from [this](https://image-relay-api.readme.io/reference/create-upload-job) endpoint.

chunk\_number

int32

required

The number of the chunk that is being uploaded.

expires\_on

date

Must be a valid date time, otherwise posting chunks will fail. This attribute is used for setting the expiration date of an asset.

keyword\_ids

array of strings

Must contain an array of valid keyword ids from your account, otherwise posting chunks will fail. This attribute is used for attaching existing keywords to an asset.

keyword\_ids
ADD string

# `` 200      200

# `` 400      400

Updated over 1 year ago

* * *

Did this page help you?

Yes

No

ShellNodeRubyPHPPython

```

xxxxxxxxxx

curl --request POST \

     --url https://api.imagerelay.com/api/v2/upload_jobs/upload_id/files/upload_file_id/chunks/chunk_number \

     --header 'accept: application/json' \

     --header 'content-type: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated over 1 year ago

* * *

Did this page help you?

Yes

No