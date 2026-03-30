import ReferenceDataClient from '../data/referenceDataClient'
import { communityCampusPdusFactory } from '../testutils/factories/communityCampusPduFactory'
import { contactOutcomesFactory } from '../testutils/factories/contactOutcomeFactory'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/referenceDataClient')

describe('ReferenceDataService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  let referenceDataService: ReferenceDataService

  beforeEach(() => {
    referenceDataService = new ReferenceDataService(referenceDataClient)
  })

  it('should call getProjectTypes on the api client and return its result', async () => {
    const projectTypes = {
      projectTypes: [
        {
          id: '1001',
          name: 'Team Lincoln',
          code: '12',
        },
      ],
    }

    referenceDataClient.getProjectTypes.mockResolvedValue(projectTypes)

    const result = await referenceDataService.getProjectTypes('some-username')

    expect(referenceDataClient.getProjectTypes).toHaveBeenCalledTimes(1)
    expect(result).toEqual(projectTypes)
  })

  it('should call getContactOutcomes on the api client and return its result', async () => {
    const contactOutcomes = contactOutcomesFactory.build()

    referenceDataClient.getContactOutcomes.mockResolvedValue(contactOutcomes)

    const result = await referenceDataService.getAvailableContactOutcomes('some-username')

    expect(referenceDataClient.getContactOutcomes).toHaveBeenCalledWith('some-username', 'AVAILABLE_TO_ADMIN')
    expect(result).toEqual(contactOutcomes)
  })

  it('should call getCommunityCampusPdus on the api client and return its result', async () => {
    const pdus = communityCampusPdusFactory.build()

    referenceDataClient.getCommunityCampusPdus.mockResolvedValue(pdus)

    const result = await referenceDataService.getCommunityCampusPdus('some-username')

    expect(referenceDataClient.getCommunityCampusPdus).toHaveBeenCalledWith('some-username')
    expect(result).toEqual(pdus)
  })

  it('should have attendedCompliedOutcome static property with value ATTC', () => {
    expect(ReferenceDataService.attendedCompliedOutcome).toBe('ATTC')
  })
})
