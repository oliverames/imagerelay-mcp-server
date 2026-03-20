To update an asset you will need to upload your new file in chunks. Each chunk must be under 5Mb. File chunks are grouped together using a v4 UUID.

### Example   [Skip link to Example](https://image-relay-api.readme.io/reference/chunked-update-versions\#example)

Here is an example using `curl` to create a new version of an asset.

**Step 1:** Request a valid v4 UUID from the API

```
curl -u "user:pass" \
  -X POST \
  -H 'User-Agent: MyApp (you@example.com)' \
  "https://api.imagerelay.com/api/v2/files/555/versions"
```

**Step 2:** Start uploading chunks.

_**Note:** The chunk number at the end of the path corresponds to the chunk being uploaded_

```
# chunk 1
curl -u "user:pass" \
  -X POST \
  -H 'Content-Type: application/octet-stream'  \
  --data-binary "@chunk1" \
  "https://api.imagerelay.com/api/v2/files/555/versions/abc-def-ghi/chunk/1"

# chunk 2
curl -u "user:pass" \
  -X POST \
  -H 'Content-Type: application/octet-stream' \
  --data-binary "@chunk2" \
  "https://api.imagerelay.com/api/v2/files/555/versions/abc-def-ghi/chunk/2"
```

**Step 3:** After all chunks have uploaded you may now make a call to the `complete` endpoint to start processing the file.

```
curl -u "user:pass" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"file_name":"image.png", "chunk_count":2}' \
  "https://api.imagerelay.com/api/v2/files/555/versions/abc-def-ghi/complete"
```

Updated over 2 years ago

* * *

Did this page help you?

Yes

No

Updated over 2 years ago

* * *

Did this page help you?

Yes

No