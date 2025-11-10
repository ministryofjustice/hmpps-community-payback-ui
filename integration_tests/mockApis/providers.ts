import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProviderTeamSummariesDto } from '../../server/@types/shared/models/ProviderTeamSummariesDto'
import { ProviderSummaryDto, SupervisorSummaryDto } from '../../server/@types/shared'
import supervisorSummaryFactory from '../../server/testutils/factories/supervisorSummaryFactory'

const mockSupervisors = supervisorSummaryFactory.buildList(2)

export default {
  stubGetProviders: ({ providers }: { providers: ProviderSummaryDto[] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: paths.providers.providers.pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { providers },
      },
    }),
  stubGetTeams: (args: { teams: ProviderTeamSummariesDto; providerCode: string }): SuperAgentRequest => {
    const path = paths.providers.teams({ providerCode: args.providerCode })
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: path,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.teams,
      },
    })
  },

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
