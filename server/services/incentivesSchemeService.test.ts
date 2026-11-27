import IncentivesSchemeClient from '../data/incentivesSchemeClient'
import IncentivesSchemeService from './incentivesSchemeService'
import incentivesSchemeDetailsFactory from '../testutils/factories/incentivesSchemeDetailsFactory'
import incentivesSchemeMetadataFactory from '../testutils/factories/incentivesSchemeMetadataFactory'

jest.mock('../data/incentivesSchemeClient')

describe('IncentivesSchemeService', () => {
  const incentivesSchemeClient = new IncentivesSchemeClient(null) as jest.Mocked<IncentivesSchemeClient>
  let incentivesSchemeService: IncentivesSchemeService

  beforeEach(() => {
    jest.resetAllMocks()
    incentivesSchemeService = new IncentivesSchemeService(incentivesSchemeClient)
  })

  describe('getDetails', () => {
    it('should call getDetails on the API client and return its result', async () => {
      const details = incentivesSchemeDetailsFactory.build()

      incentivesSchemeClient.getDetails.mockResolvedValue(details)

      const result = await incentivesSchemeService.getDetails({
        username: 'some-user-name',
        crn: 'ABC123',
        deliusEventNumber: '12345',
      })

      expect(incentivesSchemeClient.getDetails).toHaveBeenCalledTimes(1)
      expect(incentivesSchemeClient.getDetails).toHaveBeenCalledWith({
        username: 'some-user-name',
        crn: 'ABC123',
        deliusEventNumber: '12345',
      })
      expect(result).toEqual(details)
    })
  })

  describe('getMetadata', () => {
    it('should call getMetadata on the API client and return its result', async () => {
      const metadata = incentivesSchemeMetadataFactory.build()

      incentivesSchemeClient.getMetadata.mockResolvedValue(metadata)

      const result = await incentivesSchemeService.getMetadata({
        username: 'some-user-name',
      })

      expect(incentivesSchemeClient.getMetadata).toHaveBeenCalledTimes(1)
      expect(incentivesSchemeClient.getMetadata).toHaveBeenCalledWith({
        username: 'some-user-name',
      })
      expect(result).toEqual(metadata)
    })
  })
})
