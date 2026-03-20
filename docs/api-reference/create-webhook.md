| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

Image Relay webhooks all include a `resource` and an `action`. Supported resources and their actions can be viewed [here](https://image-relay-api.readme.io/reference/get-supported-webhooks).

resource

string

required

The resource the to which the webhook will be attached.

action

string

required

The action to which the webhook will be attached.

url

string

required

The url where the event details will be posted.

notification\_emails

array of strings

required

A list of emails that will be notified if an issue arises with the webhook.

notification\_emails\*
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

     --url https://api.imagerelay.com/api/v2/webhooks \

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