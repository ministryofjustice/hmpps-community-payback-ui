import { SuperAgentRequest } from 'superagent'
import { arrayToQueryStubMappings, stubFor } from './wiremock'
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
    const queryParameters: Record<string, unknown> = buildAppointmentRequest(request)

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
function buildAppointmentRequest(request: GetAppointmentsRequest): Record<string, unknown> {
  const query: Record<string, unknown> = {}

  if (request.projectCodes) {
    query.projectCodes = {
      includes: arrayToQueryStubMappings(request.projectCodes),
    }
  }

  if (request.toDate) {
    query.toDate = {
      equalTo: request.toDate,
    }
  }

  if (request.fromDate) {
    query.fromDate = {
      equalTo: request.fromDate,
    }
  }

  if (request.outcomeCodes) {
    query.outcomeCodes = {
      includes: arrayToQueryStubMappings(request.outcomeCodes),
    }
  }

  if (request.projectTypeGroup) {
    query.projectTypeGroup = {
      equalTo: request.projectTypeGroup,
    }
  }

  if (request.crn) {
    query.crn = {
      equalTo: request.crn,
    }
  }

  if (request.sort) {
    query.sort = {
      includes: arrayToQueryStubMappings(request.sort),
    }
  }
  return query
}
