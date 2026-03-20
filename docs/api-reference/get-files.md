| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

folder\_id

int32

required

The ID for the folder whose files to retrieve.

page

int32

uploaded\_after

date

Retrieve files were uploaded after the specified date. The format of the parameter should be: `"YYYY-MM-DD HH:MM:SS GMT+00:00"`. The timezone information can be left off, and UTC time will being used.

file\_type\_id

int32

Retrieve files with the corrosponding file type/metadata template.

recursive

boolean

Defaults to false

Return files in a given folder as well as all subfolders. Only relevant when retrieving files in a given folder.

truefalse

query

string

Optional search parameter

# `` 200      200

# `` 400      400

Updated 5 months ago

* * *

Did this page help you?

Yes

No

ShellNodeRubyPHPPython

```

xxxxxxxxxx

curl --request GET \

     --url https://api.imagerelay.com/api/v2/folders/folder_id/files \

     --header 'accept: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Result``400 - Result

Updated 5 months ago

* * *

Did this page help you?

Yes

No