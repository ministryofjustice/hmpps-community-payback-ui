import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AdjustmentDto, PagedModelAdjustmentDto } from '../../server/@types/shared'
import { GetAdjustmentsRequest } from '../../server/@types/user-defined'

export default {
  stubGetAdjustments: ({
    pagedAdjustments,
    crn,
    deliusEventNumber,
  }: {
    pagedAdjustments: PagedModelAdjustmentDto
    request: GetAdjustmentsRequest
    crn: string
    deliusEventNumber: string
  }): SuperAgentRequest => {
    const path = paths.offender.adjustments({ crn, deliusEventNumber })

    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: path,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: pagedAdjustments,
      },
    })
  },

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
