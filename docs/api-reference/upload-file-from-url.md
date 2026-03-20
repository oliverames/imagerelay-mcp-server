| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

filename

string

required

The name of the file that is being uploaded.

folder\_id

string

required

The ID of the folder to which the file will be added.

file\_type\_id

string

required

The ID of the metadata template/file type that the file will have. These can be acquired from [here](https://image-relay-api.readme.io/reference/get-file-types)

terms

array

required

List of metadata terms that the file may have associated with its file type/metadata template. If a given file type has 10 terms associated with it, you may include 0-10 of those terms in your calls and terms you do not specify will have empty values. These terms should be passed in the form of a hash, with a term\_id and a value. term\_id can be found [here](https://image-relay-api.readme.io/reference/get-file-type). If you don't want to set any of the metadata on upload, terms can be null.

terms\*

url

string

required

The URL of where the file will be downloaded from.

keyword\_ids

array of strings

The IDs of keywords/tags that will be associated with the new file.

keyword\_ids
ADD string

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

     --url https://api.imagerelay.com/api/v2/files \

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