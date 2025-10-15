import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProviderTeamSummariesDto } from '../../server/@types/shared/models/ProviderTeamSummariesDto'

export default {
  stubGetTeams: (args: { teams: ProviderTeamSummariesDto }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.providers.teams({ providerCode: 'N56' }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.teams,
      },
    }),

  stubGetSupervisors: (
    { providerCode, teamCode }: { providerCode: string; teamCode: string } = {
      providerCode: 'TR123',
      teamCode: 'PN123',
    },
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.providers.supervisors({ providerCode, teamCode }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { supervisors },
      },
    }),
}

export const supervisors = [
  { name: 'Terrence Matthews', code: 'XRT' },
  { name: 'Linda Small', code: 'BNM' },
]
