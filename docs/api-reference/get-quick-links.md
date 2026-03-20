| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Make a request to see history. |

#### URL Expired

The URL for this request expired after 30 days.

all

boolean

Retrive all quick links in the system.

truefalse

file\_ids

string

Retrieve quick links assosciated with particular asset(s). Pass one or more asset IDs as comma separated values.

page

int32

required

Defaults to 1

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

curl --request GET \

     --url 'https://api.imagerelay.com/api/v2/quick_links?page=1' \

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