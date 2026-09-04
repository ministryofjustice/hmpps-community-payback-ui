import AdjustmentClient from '../data/adjustmentClient'
import AdjustmentService from './adjustmentService'

jest.mock('../data/adjustmentClient')

describe('AdjustmentService', () => {
  const adjustmentClient = new AdjustmentClient(null) as jest.Mocked<AdjustmentClient>
  let adjustmentService: AdjustmentService

  beforeEach(() => {
    jest.resetAllMocks()
    adjustmentService = new AdjustmentService(adjustmentClient)
  })

  describe('deleteAdjustment', () => {
    it('should call deleteAdjustment on the client with the appropriate ID', async () => {
      const communityPaybackId = 'abcd-efgh'
      const username = 'username'

      await adjustmentService.deleteAdjustment(communityPaybackId, username)

      expect(adjustmentClient.deleteAdjustment).toHaveBeenCalledWith({
        username,
        communityPaybackId,
      })
    })
  })
})
