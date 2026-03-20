| Time | Status | User Agent |  |
| :-- | :-- | :-- | :-- |
| Retrieving recent requests… |

LoadingLoading…

#### URL Expired

The URL for this request expired after 30 days.

Once you've created a [new upload job](https://image-relay-api.readme.io/reference/create-upload-job) and you've began (or finished) [uploading your file's chunks](https://image-relay-api.readme.io/reference/upload-file-chunks), you may wish to check the status of your upload file job as it is being processed.

While the upload job is still waiting for more chunks to be uploaded, it is considered to be **processing**. While processing, the job's `finished` & `asset_id` values will be `null`.

Once all file chunks have been uploaded, the upload job's `finished` value will be set to `true` and the `asset_id` will contain the ID for the newly created asset, which can be used on [the Get File endpoint](https://image-relay-api.readme.io/reference/get-file) to retrieve details about the asset.

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

curl --request GET \

     --url https://api.imagerelay.com/api/v2/upload_jobs/upload_job_id \

     --header 'accept: application/json'
```

Click `Try It!` to start a request and see the response here! Or choose an example:

application/json

``200 - Processing``200 - Upload Complete``400 - Result

Updated over 1 year ago

* * *

Did this page help you?

Yes

No