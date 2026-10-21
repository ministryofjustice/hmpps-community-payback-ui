import { createMock } from '@golevelup/ts-jest'
import OffenderClient from '../data/offenderClient'
import OffenderService from './offenderService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import ReferenceDataService from './referenceDataService'
import personalCircumstancesFactory from '../testutils/factories/personalCircumstancesFactory'
import createAdjustmentFactory from '../testutils/factories/createAdjustmentFactory'

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

  describe('getOffenderUnpaidWorkDetail', () => {
    it('should return the unpaid work detail matching the event number', async () => {
      const matchingDetail = unpaidWorkDetailsFactory.build({ eventNumber: 2 })
      const otherDetail = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [otherDetail, matchingDetail] })
      offenderClient.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const result = await offenderService.getOffenderUnpaidWorkDetail({
        username: 'some-username',
        crn: 'X000000',
        deliusEventNumber: 2,
      })

      expect(offenderClient.getOffenderSummary).toHaveBeenCalledWith({ username: 'some-username', crn: 'X000000' })
      expect(result).toEqual(matchingDetail)
    })

    it('should return undefined when no unpaid work detail matches the event number', async () => {
      const caseDetailsSummary = caseDetailsSummaryFactory.build({
        unpaidWorkDetails: [unpaidWorkDetailsFactory.build({ eventNumber: 1 })],
      })
      offenderClient.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const result = await offenderService.getOffenderUnpaidWorkDetail({
        username: 'some-username',
        crn: 'X000000',
        deliusEventNumber: 2,
      })

      expect(offenderClient.getOffenderSummary).toHaveBeenCalledWith({ username: 'some-username', crn: 'X000000' })
      expect(result).toBeUndefined()
    })
  })

  describe('getPersonalCircumstances', () => {
    it('should call getPersonalCircumstances on the client and return its result', async () => {
      const personalCircumstances = personalCircumstancesFactory.buildList(2)

      offenderClient.getPersonalCircumstances.mockResolvedValue(personalCircumstances)
      const result = await offenderService.getPersonalCircumstances({
        username: 'some-username',
        crn: 'X000000',
      })

      expect(offenderClient.getPersonalCircumstances).toHaveBeenCalledTimes(1)
      expect(result).toEqual(personalCircumstances)
    })
  })

  describe('adjustTravelTime', () => {
    it('should call saveAdjustment on the client with travel time reason and body', async () => {
      const details = { crn: 'Y45', deliusEventNumber: 3, username: 'username' }
      const data = { appointmentId: '1', minutes: 2 }
      const adjustmentReasonId = 'X23'
      referenceDataService.getTravelAdjustmentReasonId.mockResolvedValue(adjustmentReasonId)

      await offenderService.adjustTravelTime(details, data)

      expect(referenceDataService.getTravelAdjustmentReasonId).toHaveBeenCalled()
      expect(offenderClient.saveAdjustment).toHaveBeenCalledWith(details, {
        ...data,
        type: 'Negative',
        adjustmentReasonId,
      })
    })
  })

  describe('createAdjustment', () => {
    it('should call saveAdjustment on the client with adjustment data', async () => {
      const details = { crn: 'Y45', deliusEventNumber: 3, username: 'username' }
      const adjustment = createAdjustmentFactory.build()

      await offenderService.createAdjustment(details, adjustment)

      expect(offenderClient.saveAdjustment).toHaveBeenCalledWith(details, adjustment)
    })
  })
})
