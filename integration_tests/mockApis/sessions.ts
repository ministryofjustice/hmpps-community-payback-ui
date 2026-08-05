import type { SuperAgentRequest } from 'superagent'
import { stubFor, arrayToQueryStubMappings } from './wiremock'
import paths from '../../server/paths/api'
import type { PagedModelSessionSummaryDto, SessionDto } from '../../server/@types/shared'
import type { GetSessionsRequest } from '../../server/@types/user-defined'

export default {
  stubGetSessions: ({
    request,
    sessions,
  }: {
    request: GetSessionsRequest
    sessions: PagedModelSessionSummaryDto
  }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      startDate: {
        equalTo: request.startDate,
      },
      endDate: {
        equalTo: request.endDate,
      },
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPath: paths.projects.sessions(request),
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessions,
      },
    })
  },
  stubFindSession: async ({ session }: { session: SessionDto }) => {
    const projectPath = paths.projects.singleProject({ projectCode: session.projectCode })
    const appointmentsPath = paths.appointments.filter.pattern

    const projectStub = stubFor({
      request: {
        method: 'GET',
        urlPath: projectPath,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: session,
      },
    })

    const appointmentsStub = stubFor({
      request: {
        method: 'GET',
        urlPath: appointmentsPath,
        queryParameters: {
          projectCodes: {
            includes: arrayToQueryStubMappings([session.projectCode]),
          },
          fromDate: {
            equalTo: session.date,
          },
          toDate: {
            equalTo: session.date,
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: session.appointmentSummaries,
          page: {},
        },
      },
    })

    return Promise.all([projectStub, appointmentsStub])
  },
}
