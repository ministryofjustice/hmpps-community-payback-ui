import type { SuperAgentRequest } from 'superagent'
import type { ProbationSearchResponse } from '@ministryofjustice/probation-search-frontend/data/probationSearchClient'
import { stubFor } from './wiremock'

export default {
  stubSearchPerson: (response: ProbationSearchResponse): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      page: {
        equalTo: '0',
      },
      size: {
        equalTo: '10',
      },
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPath: '/phrase',
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    })
  },
}
