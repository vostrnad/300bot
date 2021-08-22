import nock from 'nock'

const baseUrl = 'http://census.daybreakgames.com'

type RequestData = {
  pathname: string
  searchParams: Record<string, string | string[]>
}

/**
 * Intercepts a request to Census API and passes to it the given response. The
 * returned value is an object whose properties will be updated to match the
 * intercepted request.
 */
export const mockCensusApi = (response: unknown): RequestData => {
  const request: RequestData = {
    pathname: '',
    searchParams: {},
  }
  nock(baseUrl)
    .get(/.*/)
    .reply(200, (uri) => {
      const url = new URL(baseUrl + uri)

      request.pathname = url.pathname

      const searchKeysDeduped = new Set(url.searchParams.keys())
      searchKeysDeduped.forEach((key) => {
        const values = url.searchParams.getAll(key)
        if (values.length === 1) {
          request.searchParams[key] = values[0]
        } else {
          request.searchParams[key] = values.sort((a, b) =>
            Intl.Collator().compare(a, b),
          )
        }
      })

      return response
    })
  return request
}
