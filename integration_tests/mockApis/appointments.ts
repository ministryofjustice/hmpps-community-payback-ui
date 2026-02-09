import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AppointmentDto, PagedModelAppointmentSummaryDto } from '../../server/@types/shared'
import { GetAppointmentsRequest } from '../../server/data/appointmentClient'

export default {
  stubGetAppointments: ({
    request,
    pagedAppointments,
  }: {
    request: GetAppointmentsRequest
    pagedAppointments: PagedModelAppointmentSummaryDto
  }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      projectCodes: {
        includes: request.projectCodes?.map(projectCode => ({ equalTo: projectCode })) ?? [],
      },
      toDate: {
        equalTo: request.toDate ?? undefined,
      },
      outcomeCodes: {
        includes: request.outcomeCodes?.map(outcomeCode => ({ equalTo: outcomeCode })) ?? [],
      },
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPath: paths.appointments.filter.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: pagedAppointments,
      },
    })
  },
  stubFindAppointment: ({ appointment }: { appointment: AppointmentDto }): SuperAgentRequest => {
    const pattern = paths.appointments.singleAppointment({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...appointment,
        },
      },
    })
  },

  stubUpdateAppointmentOutcome: ({ appointment }: { appointment: AppointmentDto }): SuperAgentRequest => {
    const pattern = paths.appointments.outcome({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
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
}
