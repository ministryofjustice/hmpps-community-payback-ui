import AdjustmentClient from '../data/adjustmentClient'
import AdjustmentService from './adjustmentService'
import adjustmentFactory from '../testutils/factories/adjustmentFactory'

jest.mock('../data/adjustmentClient')

describe('AdjustmentService', () => {
  const adjustmentClient = new AdjustmentClient(null) as jest.Mocked<AdjustmentClient>
  let adjustmentService: AdjustmentService

  beforeEach(() => {
    jest.resetAllMocks()
    adjustmentService = new AdjustmentService(adjustmentClient)
  })

  describe('getAdjustment', () => {
    it('should call getAdjustment on the client with the appropriate ID and return the result', async () => {
      const communityPaybackId = 'abcd-efgh'
      const username = 'username'
      const adjustment = adjustmentFactory.build({ id: communityPaybackId })
      adjustmentClient.getAdjustment.mockResolvedValue(adjustment)

      const result = await adjustmentService.getAdjustment(communityPaybackId, username)

      expect(adjustmentClient.getAdjustment).toHaveBeenCalledWith({
        username,
        communityPaybackId,
      })
      expect(result).toEqual(adjustment)
    })
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
