import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import idempotencyKey from '../utils/restClientUtils'
import { AdjustmentDto, PagedModelAdjustmentDto } from '../@types/shared'
import { createQueryString } from '../utils/utils'
import { GetAdjustmentsRequest } from '../@types/user-defined'

export default class AdjustmentClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('adjustmentClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getAdjustments(username: string, params: GetAdjustmentsRequest): Promise<PagedModelAdjustmentDto> {
    const { page, size, sort, crn, deliusEventNumber } = params
    const query = createQueryString({ page, size, sort, type: 'OTHER' }, { encodeValuesOnly: true, indices: false })

    const path = paths.offender.adjustments({ crn, deliusEventNumber })

    return (await this.get({ path, query }, asSystem(username))) as PagedModelAdjustmentDto
  }

  async getAdjustment({
    username,
    communityPaybackId,
  }: {
    username: string
    communityPaybackId: string
  }): Promise<AdjustmentDto> {
    const path = paths.adjustments.show({ communityPaybackId })
    return this.get({ path }, asSystem(username))
  }

  async deleteAdjustment({
    username,
    communityPaybackId,
  }: {
    username: string
    communityPaybackId: string
  }): Promise<void> {
    const path = paths.adjustments.delete({ communityPaybackId })
    return this.delete({ path, headers: idempotencyKey('delete-adjustment', communityPaybackId) }, asSystem(username))
  }
}
