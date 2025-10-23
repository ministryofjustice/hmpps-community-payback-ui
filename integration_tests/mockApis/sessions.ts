import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { SessionSummariesDto, SessionDto } from '../../server/@types/shared'
import type { GetSessionsRequest } from '../../server/@types/user-defined'

export default {
  stubGetSessions: ({
    request,
    sessions,
  }: {
    request: GetSessionsRequest
    sessions: SessionSummariesDto
  }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      teamCode: {
        equalTo: request.teamCode,
      },
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
        urlPath: paths.projects.sessions.pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessions,
      },
    })
  },
  stubFindSession: ({ session }: { session: SessionDto }): SuperAgentRequest => {
    const pattern = paths.projects.sessionAppointments({ projectCode: session.projectCode, date: session.date })
    return stubFor({
      request: {
        method: 'GET',
        urlPath: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: session,
      },
    })
  },
}
