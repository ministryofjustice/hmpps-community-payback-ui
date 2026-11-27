import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { IncentivesSchemeDetails, IncentivesSchemeMetadata } from '../../server/@types/shared'

export default {
  stubGetIncentivesSchemeDetails: ({
    details,
    crn,
    deliusEventNumber,
  }: {
    details: IncentivesSchemeDetails
    crn: string
    deliusEventNumber: string
  }): SuperAgentRequest => {
    const path = paths.incentivesScheme.details({ crn, deliusEventNumber })

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: path,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details,
      },
    })
  },

  stubGetIncentivesSchemeMetadata: ({ metadata }: { metadata: IncentivesSchemeMetadata }): SuperAgentRequest => {
    const path = paths.incentivesScheme.metadata

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: path,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: metadata,
      },
    })
  },
}
