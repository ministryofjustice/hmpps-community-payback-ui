import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AppointmentDto, CaseDetailsSummaryDto } from '../../server/@types/shared'

export default {
  stubGetOffenderSummary: (args: { caseDetailsSummary: CaseDetailsSummaryDto }): SuperAgentRequest => {
    const pattern = paths.offender.summary({ crn: args.caseDetailsSummary.offender.crn })
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
  stubSaveAdjustment: ({ appointment }: { appointment: AppointmentDto }): SuperAgentRequest => {
    const pattern = paths.offender.adjustments({
      crn: appointment.offender.crn,
      deliusEventNumber: appointment.deliusEventNumber.toString(),
    })
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubSaveAdjustmentWithError: ({
    appointment,
    userMessage,
  }: {
    appointment: AppointmentDto
    userMessage: string
  }): SuperAgentRequest => {
    const pattern = paths.offender.adjustments({
      crn: appointment.offender.crn,
      deliusEventNumber: appointment.deliusEventNumber.toString(),
    })
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: pattern,
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
