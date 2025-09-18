import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProjectAllocationsDto } from '../../server/@types/shared/models/ProjectAllocationsDto'

export default {
  stubGetSessions: (args: { sessions: ProjectAllocationsDto }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.projects.sessions({}),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.sessions,
      },
    }),
}
