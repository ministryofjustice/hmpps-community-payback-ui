import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProviderTeamSummariesDto } from '../../server/@types/shared/models/ProviderTeamSummariesDto'
import { ProviderSummariesDto, SupervisorSummaryDto } from '../../server/@types/shared'
import supervisorSummaryFactory from '../../server/testutils/factories/supervisorSummaryFactory'

const mockSupervisors = supervisorSummaryFactory.buildList(2)

export default {
  stubGetProviders: (args: { providers: ProviderSummariesDto }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/admin/providers\\?username=.*',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.providers,
      },
    }),
  stubGetTeams: ({
    teams,
    providerCode = 'N56',
  }: {
    teams: ProviderTeamSummariesDto
    providerCode: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: paths.providers.teams({ providerCode }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: teams,
      },
    }),

  stubGetSupervisors: (
    {
      providerCode,
      teamCode,
      supervisors,
    }: { providerCode: string; teamCode: string; supervisors: SupervisorSummaryDto[] } = {
      providerCode: 'TR123',
      teamCode: 'PN123',
      supervisors: mockSupervisors,
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
