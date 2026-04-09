import { createMock } from '@golevelup/ts-jest'
import OffenderClient from '../data/offenderClient'
import OffenderService from './offenderService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/offenderClient')

describe('OffenderService', () => {
  const offenderClient = new OffenderClient(null) as jest.Mocked<OffenderClient>
  const referenceDataService = createMock<ReferenceDataService>()
  let offenderService: OffenderService

  beforeEach(() => {
    jest.resetAllMocks()
    offenderService = new OffenderService(offenderClient, referenceDataService)
  })

  describe('getOffenderSummary', () => {
    it('should call getOffenderSummary on the client and return its result', async () => {
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      offenderClient.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      const result = await offenderService.getOffenderSummary({
        username: 'some-username',
        crn: 'X000000',
      })

      expect(offenderClient.getOffenderSummary).toHaveBeenCalledTimes(1)
      expect(result).toEqual(caseDetailsSummary)
    })
  })

  describe('adjustTravelTime', () => {
    it('should call saveAdjustment on the client with travel time reason and body', async () => {
      const details = { crn: 'Y45', deliusEventNumber: 3, username: 'username' }
      const data = { taskId: '1', minutes: 2 }
      const adjustmentReasonId = 'X23'
      referenceDataService.getTravelAdjustmentReasonId.mockResolvedValue(adjustmentReasonId)

      const refDate = new Date('2025-02-01')
      jest.useFakeTimers().setSystemTime(refDate.getTime())

      await offenderService.adjustTravelTime(details, data)

      expect(referenceDataService.getTravelAdjustmentReasonId).toHaveBeenCalled()
      expect(offenderClient.saveAdjustment).toHaveBeenCalledWith(details, {
        ...data,
        type: 'Negative',
        adjustmentReasonId,
        dateOfAdjustment: refDate.toISOString(),
      })
    })
  })
})
