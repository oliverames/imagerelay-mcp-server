Our API implements two different pagination techniques, it's helpful to know how they both work so you can create your API integration in a way that can detect and work with both techniques.

**Technique #1: Pagination object will be in the response body**

This is easy to see in an index response because the response payload will be an object instead of an array, and there will be a top-level key named "pagination" that contains the pagination information. An example of this is shown below

JSON

```json
"pagination": {
        "current": 1,
        "previous": null,
        "next": null,
        "per_page": 100,
        "pages": 1,
        "count": 2,
        "prev_page_path": null,
        "next_page_path": null
    }
```

**Techinque #2: Pagination information will be in a response header**

These payloads are easily distinguishable by their response body being an array of objects as opposed to a top-level object in the example above. In addition, pagination information will be contained in a response header called [Link header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link)

We are in the process of adding the Link header to all API responses that have the format described in technique #2 above. If you notice an API response that is missing the expected header, please let us know.

Updated almost 2 years ago

* * *

Did this page help you?

Yes

No

Updated almost 2 years ago

* * *

Did this page help you?

Yes

No