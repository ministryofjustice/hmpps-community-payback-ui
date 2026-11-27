import { IncentivesSchemeDetails, IncentivesSchemeMetadata } from '../@types/shared'
import IncentivesSchemeClient, { GetIncentivesSchemeDetailsRequest } from '../data/incentivesSchemeClient'
import { BaseRequest } from '../@types/user-defined'

export default class IncentivesSchemeService {
  constructor(private readonly incentivesSchemeClient: IncentivesSchemeClient) {}

  async getDetails(request: GetIncentivesSchemeDetailsRequest): Promise<IncentivesSchemeDetails> {
    return this.incentivesSchemeClient.getDetails(request)
  }

  async getMetadata(request: BaseRequest): Promise<IncentivesSchemeMetadata> {
    return this.incentivesSchemeClient.getMetadata(request)
  }
}
