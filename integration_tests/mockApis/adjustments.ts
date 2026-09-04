import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'

export default {
  stubDeleteAdjustment: (): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {}

    return stubFor({
      request: {
        method: 'DELETE',
        urlPath: paths.adjustments.delete,
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    })
  },

  stubDeleteAdjustmentWithError: ({ userMessage }: { userMessage: string }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {}

    return stubFor({
      request: {
        method: 'DELETE',
        urlPath: paths.adjustments.delete,
        queryParameters,
      },
      response: {
        status: 400,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          status: 400,
          userMessage,
          developerMessage: 'Bad request',
        },
      },
    })
  },
}
