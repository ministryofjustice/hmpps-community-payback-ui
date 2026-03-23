import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { CaseDetailsSummaryDto } from '../../server/@types/shared'

export default {
  stubGetOffenderSummary: (args: { caseDetailsSummary: CaseDetailsSummaryDto }): SuperAgentRequest => {
    const pattern = paths.offenders.summary({ crn: args.caseDetailsSummary.offender.crn })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...args.caseDetailsSummary,
        },
      },
    })
  },
}
