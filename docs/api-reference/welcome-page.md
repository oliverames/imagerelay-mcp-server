The [Image Relay](https://imagerelay.com/) API allows IR users to access many Image Relay features through a JSON RESTful web interface. Not all plans have access to the API, please see [https://www.imagerelay.com/pricing](https://www.imagerelay.com/pricing) for details and contact [sales@imagerelay.com](mailto:sales@imagerelay.com) if you'd like to learn more about adding API access to your plan.

## Identify your app   [Skip link to Identify your app](https://image-relay-api.readme.io/reference/welcome-page\#identify-your-app)

You must include a `User-Agent` header with the name of your application and a link to it or your email address so we can get in touch in case you're doing something wrong or something great. Here's an example:

```
User-Agent: MyCompany (http://www.mycompany.com)
```

If you don't supply this header, you will get a `403 Forbidden`.

## Rate limiting   [Skip link to Rate limiting](https://image-relay-api.readme.io/reference/welcome-page\#rate-limiting)

You can perform up to 5 requests/second from the same IP address. If you exceed this limit, you'll get a [429 Too Many Requests](http://tools.ietf.org/html/draft-nottingham-http-new-status-02#section-4) response for subsequent requests. API usage is limited to Professional and Enterprise plans, and should adhere to daily request limits. For more information about our API please contact [sales@imagerelay.com](mailto:sales@imagerelay.com).

## Errors   [Skip link to Errors](https://image-relay-api.readme.io/reference/welcome-page\#errors)

The actions you can access in the API are dependent upon the permission levels assigned to your Image Relay account.

For instance, not all users are permitted to upload files or create folders, or see a list of users. If you find yourself receiving "401 Unauthorized" errors, please confirm your permission level with your Image Relay Administrator.

If you have questions or trouble implementing the API, you can reach out to [support@imagerelay.com](mailto:support@imagerelay.com) and we'll help you out.

Need general help with Image Relay? Check out our [online support center](http://support.imagerelay.com/).

## Status Code Explanations   [Skip link to Status Code Explanations](https://image-relay-api.readme.io/reference/welcome-page\#status-code-explanations)

- 401: Invalid or unauthorized API user – verify your API user is valid and authorized to access the API. Contact support if you'd like assistance.
- 403: Missing User-Agent header - all API requests require a User-Agent header, please identify yourself appropriately
- 405: Unknown HTTP method - we only support standard HTTP requests, please double-check your request verb
- 429: Too many requests (throttling) – slow down your request frequency
- 502: Under heavy load – slow down your request frequency
- 5xx: Server error - please double-check your JSON payload for formatting errors, data integrity, etc.

## Need Help?   [Skip link to Need Help?](https://image-relay-api.readme.io/reference/welcome-page\#need-help)

Contact support if you have any questions at [support@imagerelay.com](mailto:support@imagerelay.com) or [browse our support site](https://support.imagerelay.com/en/).

Updated about 1 year ago

* * *

Did this page help you?

Yes

No

Updated about 1 year ago

* * *

Did this page help you?

Yes

No