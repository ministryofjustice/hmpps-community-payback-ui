import { GetAdjustmentsRequest } from '../@types/user-defined'
import AdjustmentClient from '../data/adjustmentClient'
import pagedModelAdjustmentFactory from '../testutils/factories/pagedModelAdjustmentFactory'
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

  describe('getAdjustments', () => {
    it('should call getAdjustments on the client', async () => {
      const request: GetAdjustmentsRequest = {
        crn: 'abc123',
        deliusEventNumber: '1',
      }
      const username = 'username'

      const adjustments = pagedModelAdjustmentFactory.build()
      adjustmentClient.getAdjustments.mockResolvedValue(adjustments)

      const result = await adjustmentService.getAdjustments(username, request)

      expect(adjustmentClient.getAdjustments).toHaveBeenCalledWith(username, request)

      expect(result).toEqual({
        ...adjustments,
        page: {
          ...adjustments.page,
          number: 1,
        },
      })
    })
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
