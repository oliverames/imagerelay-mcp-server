| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Make a request to see history. |

#### URL Expired

The URL for this request expired after 30 days.

keyword\_set\_id

int32

required

The ID of the keyword set whose keywords to retrieve.

keyword\_id

int32

required

The ID of the keyword to retrieve.

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

     --url https://api.imagerelay.com/api/v2/keyword_sets/%7Bkeyword_set_id/keywords/keyword_id \

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