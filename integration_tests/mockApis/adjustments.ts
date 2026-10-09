import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AdjustmentDto } from '../../server/@types/shared'

export default {
  stubGetAdjustment: ({ adjustment }: { adjustment: AdjustmentDto }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: paths.adjustments.show({ communityPaybackId: adjustment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: adjustment,
      },
    })
  },

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
