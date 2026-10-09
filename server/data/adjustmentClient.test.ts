import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import paths from '../paths/api'
import AdjustmentClient from './adjustmentClient'
import adjustmentFactory from '../testutils/factories/adjustmentFactory'

describe('AdjustmnetClient', () => {
  let adjustmentClient: AdjustmentClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    adjustmentClient = new AdjustmentClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getAdjustment', () => {
    it('should make a GET request to adjustments path using user token and return the response body', async () => {
      const communityPaybackId = 'abcd-efgh'
      const adjustment = adjustmentFactory.build({ id: communityPaybackId })

      nock(config.apis.communityPaybackApi.url)
        .get(paths.adjustments.show({ communityPaybackId }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, adjustment)

      const response = await adjustmentClient.getAdjustment({ username: 'some-user-name', communityPaybackId })

      expect(response).toEqual(adjustment)
    })
  })

  describe('deleteAdjustment', () => {
    it('should make a DELETE request to adjustments path using user token', async () => {
      const communityPaybackId = 'abcd-efgh'

      nock(config.apis.communityPaybackApi.url)
        .delete(paths.adjustments.delete({ communityPaybackId }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      const response = await adjustmentClient.deleteAdjustment({ username: 'some-user-name', communityPaybackId })

      expect(response).toBeTruthy()
    })
  })
})
