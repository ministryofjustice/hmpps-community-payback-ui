import { PagedModelAdjustmentDto } from '../@types/shared'
import { GetAdjustmentsRequest } from '../@types/user-defined'
import AdjustmentClient from '../data/adjustmentClient'
import { uiPageNumber } from '../utils/paginationUtils'

export default class AdjustmentService {
  constructor(private readonly adjustmentClient: AdjustmentClient) {}

  async getAdjustments(username: string, request: GetAdjustmentsRequest): Promise<PagedModelAdjustmentDto> {
    const adjustmentResult = await this.adjustmentClient.getAdjustments(username, request)

    return {
      ...adjustmentResult,
      page: { ...adjustmentResult.page, number: uiPageNumber(adjustmentResult.page) },
    }
  }

  async deleteAdjustment(communityPaybackId: string, username: string) {
    return this.adjustmentClient.deleteAdjustment({ username, communityPaybackId })
  }
}
