import nock from 'nock'
import { AuthenticationClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import IncentivesSchemeClient from './incentivesSchemeClient'
import incentivesSchemeDetailsFactory from '../testutils/factories/incentivesSchemeDetailsFactory'
import incentivesSchemeMetadataFactory from '../testutils/factories/incentivesSchemeMetadataFactory'

describe('incentivesSchemeClient', () => {
  let incentivesSchemeClient: IncentivesSchemeClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn(username => {
        return `test-system-token-for-${username}`
      }),
    } as unknown as jest.Mocked<AuthenticationClient>

    incentivesSchemeClient = new IncentivesSchemeClient(mockAuthenticationClient)
  })

  describe('getDetails', () => {
    it('should make a GET request to the incentives scheme details path using system token and return the response body', async () => {
      const details = incentivesSchemeDetailsFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get('/admin/incentives-scheme/details/ABC123/12345')
        .matchHeader('authorization', 'Bearer test-system-token-for-some-user-name')
        .reply(200, details)

      const response = await incentivesSchemeClient.getDetails({
        username: 'some-user-name',
        crn: 'ABC123',
        deliusEventNumber: '12345',
      })

      expect(response).toEqual(details)
    })

    it('should throw an error when the response status is not 200', async () => {
      nock(config.apis.communityPaybackApi.url)
        .get('/admin/incentives-scheme/details/ABC123/12345')
        .matchHeader('authorization', 'Bearer test-system-token-for-some-user-name')
        .reply(401)

      const makeCall = async () => {
        await incentivesSchemeClient.getDetails({
          username: 'some-user-name',
          crn: 'ABC123',
          deliusEventNumber: '12345',
        })
      }

      await expect(makeCall).rejects.toThrow(SanitisedError)
    })
  })

  describe('getMetadata', () => {
    it('should make a GET request to the incentives scheme metadata path using system token and return the response body', async () => {
      const metadata = incentivesSchemeMetadataFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get('/admin/incentives-scheme/metadata')
        .matchHeader('authorization', 'Bearer test-system-token-for-some-user-name')
        .reply(200, metadata)

      const response = await incentivesSchemeClient.getMetadata({
        username: 'some-user-name',
      })

      expect(response).toEqual(metadata)
    })

    it('should throw an error when the response status is not 200', async () => {
      nock(config.apis.communityPaybackApi.url)
        .get('/admin/incentives-scheme/metadata')
        .matchHeader('authorization', 'Bearer test-system-token-for-some-user-name')
        .reply(401)

      const makeCall = async () => {
        await incentivesSchemeClient.getMetadata({
          username: 'some-user-name',
        })
      }

      await expect(makeCall).rejects.toThrow(SanitisedError)
    })
  })
})
