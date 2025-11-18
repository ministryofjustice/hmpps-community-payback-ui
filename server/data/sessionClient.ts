import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { SessionDto, SessionSummariesDto } from '../@types/shared'
import { GetSessionRequest, GetSessionsRequest } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export default class SessionClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getSessions({
    username,
    providerCode,
    teamCode,
    startDate,
    endDate,
  }: GetSessionsRequest): Promise<SessionSummariesDto> {
    const path = paths.projects.sessions({ providerCode, teamCode })
    const query = createQueryString({ startDate, endDate })

    return (await this.get({ path, query }, asSystem(username))) as SessionSummariesDto
  }

  async find({ username, projectCode, date }: GetSessionRequest): Promise<SessionDto> {
    const path = paths.projects.sessionAppointments({ projectCode, date })
    return (await this.get({ path }, asSystem(username))) as SessionDto
  }
}
