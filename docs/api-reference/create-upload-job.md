| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

Each upload job will create a single asset. You'll need the `id` and `files.id` values from a 200 success response to upload your file to [the Upload File Chunks](https://image-relay-api.readme.io/reference/upload-file-chunks) endpoint.

folder\_id

int32

required

ID of the folder to which the uploaded asset will be added.

file\_type\_id

int32

required

ID of the file type/metadata template to which the asset will be associated.

files

array of objects

required

Array of file objects, but should only contain a singlular file

files\*
ADD object

prefix

string

Optional subfolder path where the file will be stored

terms

array of objects

Optional metadata term values to be applied to the file being uploaded. These term IDs must belong to the provided file\_type\_id parent

terms
ADD object

expires\_on

date

Optional date to assign as the expiration date for the file being uploaded. See documentation for details on file expiration dates

keyword\_ids

array of int32s

Optional array of keyword (tag) IDs to be applied to the file being uploaded

keyword\_ids
ADD int32

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

     --url https://api.imagerelay.com/api/v2/upload_jobs \

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