import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import OffenderClient from './offenderClient'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import paths from '../paths/api'
import createAdjustmentFactory from '../testutils/factories/createAdjustmentFactory'

describe('OffenderClient', () => {
  let offenderClient: OffenderClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    offenderClient = new OffenderClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getOffenderSummary', () => {
    it('should make a GET request to offender summary path and return the response body', async () => {
      const crn = 'X000000'

      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(paths.offender.summary({ crn }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, caseDetailsSummary)

      const response = await offenderClient.getOffenderSummary({ username: 'some-username', crn })

      expect(response).toEqual(caseDetailsSummary)
    })
  })

  describe('saveAdjustment', () => {
    it('should make a POST request to adjustments path using user token', async () => {
      const adjustmentData = createAdjustmentFactory.build()
      const crn = 'X123'

      nock(config.apis.communityPaybackApi.url)
        .post(paths.offender.adjustments({ crn, deliusEventNumber: '1' }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      const response = await offenderClient.saveAdjustment(
        { username: 'some-user-name', crn, deliusEventNumber: 1 },
        adjustmentData,
      )

      expect(response).toBeTruthy()
    })
  })
})
