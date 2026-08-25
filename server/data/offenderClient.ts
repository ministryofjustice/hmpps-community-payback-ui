import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { CaseDetailsSummaryDto, CreateAdjustmentDto, PersonalCircumstancesDto } from '../@types/shared'
import { BaseRequest } from '../@types/user-defined'
import idempotencyKey from '../utils/restClientUtils'

export interface OffenderRequirementRequest extends BaseRequest {
  crn: string
  deliusEventNumber: number
}

export default class OffenderClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('offenderClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getOffenderSummary({ username, crn }: { username: string; crn: string }): Promise<CaseDetailsSummaryDto> {
    const path = paths.offender.summary({ crn })
    return (await this.get({ path }, asSystem(username))) as CaseDetailsSummaryDto
  }

  async getPersonalCircumstances({
    username,
    crn,
  }: {
    username: string
    crn: string
  }): Promise<PersonalCircumstancesDto> {
    const path = paths.offender.personalCircumstances({ crn })
    return (await this.get({ path }, asSystem(username))) as PersonalCircumstancesDto
  }

  async saveAdjustment(
    { username, crn, deliusEventNumber }: OffenderRequirementRequest,
    data: CreateAdjustmentDto,
  ): Promise<void> {
    const path = paths.offender.adjustments({ crn, deliusEventNumber: deliusEventNumber.toString() })
    return this.post(
      { path, data, retry: true, headers: idempotencyKey('post-adjustment', data.appointmentId) },
      asSystem(username),
    )
  }
}
