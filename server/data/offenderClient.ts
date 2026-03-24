import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { CaseDetailsSummaryDto } from '../@types/shared'

export default class OffenderClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('offenderClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getOffenderSummary({ username, crn }: { username: string; crn: string }): Promise<CaseDetailsSummaryDto> {
    const path = paths.offenders.summary({ crn })
    return (await this.get({ path }, asSystem(username))) as CaseDetailsSummaryDto
  }
}
