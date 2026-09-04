import AdjustmentClient from '../data/adjustmentClient'

export default class AdjustmentService {
  constructor(private readonly adjustmentClient: AdjustmentClient) {}

  async deleteAdjustment(communityPaybackId: string, username: string) {
    return this.adjustmentClient.deleteAdjustment({ username, communityPaybackId })
  }
}
