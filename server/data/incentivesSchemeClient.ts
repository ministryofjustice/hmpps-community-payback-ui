import { RestClient, asSystem, AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { IncentivesSchemeDetails, IncentivesSchemeMetadata } from '../@types/shared'
import { BaseRequest } from '../@types/user-defined'

export interface GetIncentivesSchemeDetailsRequest extends BaseRequest {
  crn: string
  deliusEventNumber: string
}

export default class IncentivesSchemeClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('incentivesSchemeClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getDetails({
    username,
    crn,
    deliusEventNumber,
  }: GetIncentivesSchemeDetailsRequest): Promise<IncentivesSchemeDetails> {
    const path = paths.incentivesScheme.details({ crn, deliusEventNumber })
    return (await this.get({ path }, asSystem(username))) as IncentivesSchemeDetails
  }

  async getMetadata({ username }: BaseRequest): Promise<IncentivesSchemeMetadata> {
    const path = paths.incentivesScheme.metadata({})
    return (await this.get({ path }, asSystem(username))) as IncentivesSchemeMetadata
  }
}
