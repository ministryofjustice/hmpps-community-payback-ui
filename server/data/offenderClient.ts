import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { CaseDetailsSummaryDto } from '../@types/shared'
import paths from '../paths/api'
import { GetOffenderRequest } from '../@types/user-defined'

export default class OffenderClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('offenderClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getOffenderSummary({ crn, username }: GetOffenderRequest): Promise<CaseDetailsSummaryDto> {
    const path = paths.offender.summary({ crn })
    return (await this.get({ path }, asSystem(username))) as CaseDetailsSummaryDto
  }
}
