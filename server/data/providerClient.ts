import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ProviderTeamSummariesDto } from '../@types/shared/models/ProviderTeamSummariesDto'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { GetForTeamRequest } from '../@types/user-defined'
import { ProviderSummariesDto, SupervisorSummariesDto } from '../@types/shared'
import { createQueryString } from '../utils/utils'

export default class ProviderClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('providerClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getProviders(username: string): Promise<ProviderSummariesDto> {
    const path = paths.providers.providers.pattern
    const query = createQueryString({ username })
    return (await this.get({ path, query }, asSystem(username))) as ProviderSummariesDto
  }

  async getTeams(providerCode: string, username: string): Promise<ProviderTeamSummariesDto> {
    return (await this.get(
      { path: paths.providers.teams({ providerCode }) },
      asSystem(username),
    )) as ProviderTeamSummariesDto
  }

  async getSupervisors({ providerCode, teamCode, username }: GetForTeamRequest): Promise<SupervisorSummariesDto> {
    const path = paths.providers.supervisors({ providerCode, teamCode })
    return (await this.get({ path }, asSystem(username))) as SupervisorSummariesDto
  }
}
