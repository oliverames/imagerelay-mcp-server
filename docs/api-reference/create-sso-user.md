| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

For SSO-enabled accounts, you may want to create SSO users in lieu of turning on JIT user creation. Make sure the email address in the JSON matches the user's email in your user database, otherwise they won't be able to log in with SSO.

first\_name

string

The first name of the new user.

last\_name

string

The last name of the new user.

email

string

The email of the new user.

company

string

The name of user's company.

role\_id

string

The ID of the permission group to which the new user will be added.

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

     --url https://api.imagerelay.com/api/v2/users/sso_user \

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