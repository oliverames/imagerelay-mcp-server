| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

file\_id

int32

required

The ID for file thats metadata terms are being updated

terms

array of objects

required

An array of term IDs and values to update.

terms\*
ADD object

overwrite

boolean

required

If true, the entire value for the term will be overwritten, if false, it will append the value to any existing metadata term value already present in that term field.

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

     --url https://api.imagerelay.com/api/v2/files/file_id/terms \

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