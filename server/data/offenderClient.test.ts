import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import OffenderClient from './offenderClient'
import config from '../config'
import projectFactory from '../testutils/factories/projectFactory'
import paths from '../paths/api'

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
    it('should make a GET request to the find summary path using user token and return the response body', async () => {
      const crn = '1'

      const project = projectFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(paths.offender.summary({ crn }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, project)

      const response = await offenderClient.getOffenderSummary({ crn, username: 'some-user' })

      expect(response).toEqual(project)
    })
  })
})
