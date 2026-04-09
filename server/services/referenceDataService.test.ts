import ReferenceDataClient from '../data/referenceDataClient'
import adjustmentReasonFactory from '../testutils/factories/adjustmentReasonFactory'
import { communityCampusPdusFactory } from '../testutils/factories/communityCampusPduFactory'
import { contactOutcomesFactory } from '../testutils/factories/contactOutcomeFactory'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/referenceDataClient')

describe('ReferenceDataService', () => {
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  let referenceDataService: ReferenceDataService

  beforeEach(() => {
    jest.resetAllMocks()
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

  it('should call getAdjustmentReasons on the api client and return its result', async () => {
    const adjustmentReasons = adjustmentReasonFactory.buildList(2)

    referenceDataClient.getAdjustmentReasons.mockResolvedValue({ adjustmentReasons })

    const result = await referenceDataService.getAdjustmentReasons('some-username')

    expect(referenceDataClient.getAdjustmentReasons).toHaveBeenCalledWith('some-username')
    expect(result).toEqual(adjustmentReasons)
  })

  describe('getTravelAdjustmentId', () => {
    it('should fetch adjustment reasons and return reason with travel reason code', async () => {
      const matchingAdjustment = adjustmentReasonFactory.build({ deliusCode: 'TTX' })
      const adjustmentReasons = [adjustmentReasonFactory.build(), matchingAdjustment]

      referenceDataClient.getAdjustmentReasons.mockResolvedValue({ adjustmentReasons })

      const result = await referenceDataService.getTravelAdjustmentReasonId('some-username')

      expect(referenceDataClient.getAdjustmentReasons).toHaveBeenCalledWith('some-username')
      expect(result).toEqual(matchingAdjustment.id)
    })

    it('should throw an error if travel adjustment reason not found', () => {
      const adjustmentReasons = adjustmentReasonFactory.buildList(2)

      referenceDataClient.getAdjustmentReasons.mockResolvedValue({ adjustmentReasons })

      expect(referenceDataService.getTravelAdjustmentReasonId('some-username')).rejects.toThrow(
        new Error('Adjustment reason with code TTX not found.'),
      )
    })
  })

  it('should have attendedCompliedOutcome static property with value ATTC', () => {
    expect(ReferenceDataService.attendedCompliedOutcome).toBe('ATTC')
  })
})
