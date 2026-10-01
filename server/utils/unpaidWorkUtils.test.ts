import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFormFactory from '../testutils/factories/courseCompletionFormFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import UnpaidWorkUtils from './unpaidWorkUtils'

describe('UnpaidWorkUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('unpaidWorkHoursDetails', () => {
    it('returns formatted hours details without totalHoursRemaining', () => {
      const unpaidWorkDetail = unpaidWorkDetailsFactory.build({
        requiredMinutes: 180,
        completedMinutes: 100,
        completedEteMinutes: 60,
        remainingEteMinutes: 30,
        allowedEteMinutes: 90,
      })

      const result = UnpaidWorkUtils.unpaidWorkHoursDetails(unpaidWorkDetail)

      expect(result).toEqual({
        totalHoursOrdered: '3 hours',
        maximumEteHours: '1 hour 30 minutes',
        eteHoursCredited: '1 hour',
        eteHoursRemaining: '30 minutes',
        totalHoursRemaining: undefined,
      })
    })

    it('returns formatted hours details with totalHoursRemaining when includeTotalHoursRemaining is true', () => {
      const unpaidWorkDetail = unpaidWorkDetailsFactory.build({
        requiredMinutes: 180,
        completedMinutes: 100,
        completedEteMinutes: 60,
        remainingEteMinutes: 30,
        allowedEteMinutes: 90,
      })

      const result = UnpaidWorkUtils.unpaidWorkHoursDetails(unpaidWorkDetail, true)

      expect(result).toEqual({
        totalHoursOrdered: '3 hours',
        maximumEteHours: '1 hour 30 minutes',
        eteHoursCredited: '1 hour',
        eteHoursRemaining: '30 minutes',
        totalHoursRemaining: '1 hour 20 minutes', // 180 - 100 = 80 minutes
      })
    })
  })

  describe('getRemainingEteHoursAndMinutes', () => {
    it('returns appropriate remaining time when not negative', () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({
        remainingEteMinutes: 200,
      })

      const formData = courseCompletionFormFactory.build({
        timeToCredit: {
          hours: '1',
          minutes: '10',
        },
      })

      expect(UnpaidWorkUtils.getRemainingEteHoursAndMinutes(formData, unpaidWorkDetails)).toBe('2 hours 10 minutes')
    })

    it('returns 0 minutes when remaining time is zero', () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({
        remainingEteMinutes: 60,
      })

      const formData = courseCompletionFormFactory.build({
        timeToCredit: {
          hours: '1',
          minutes: '0',
        },
      })

      expect(UnpaidWorkUtils.getRemainingEteHoursAndMinutes(formData, unpaidWorkDetails)).toBe('0 minutes')
    })

    it('returns null when remaining time is negative', () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({
        remainingEteMinutes: 2,
      })

      const formData = courseCompletionFormFactory.build({
        timeToCredit: {
          hours: '1',
          minutes: '10',
        },
      })

      expect(UnpaidWorkUtils.getRemainingEteHoursAndMinutes(formData, unpaidWorkDetails)).toBe(null)
    })

    it('returns null when the unpaid work detail is missing', () => {
      const formData = courseCompletionFormFactory.build({
        timeToCredit: {
          hours: '1',
          minutes: '0',
        },
      })

      expect(UnpaidWorkUtils.getRemainingEteHoursAndMinutes(formData, null)).toBe(null)
    })

    it("returns null when the formData's timeToCredit is missing", () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({
        remainingEteMinutes: 60,
      })

      const formData = courseCompletionFormFactory.build({
        timeToCredit: undefined,
      })

      expect(UnpaidWorkUtils.getRemainingEteHoursAndMinutes(formData, unpaidWorkDetails)).toBe(null)
    })
  })

  describe('getUnpaidWorkOptions', () => {
    it('returns an array of options', () => {
      const upwDetails = unpaidWorkDetailsFactory.build({
        sentenceDate: '2020-03-15',
        requiredMinutes: 240,
        completedEteMinutes: 100,
        remainingEteMinutes: 140,
        upwStatus: 'Being worked',
      })
      const { unpaidWorkDetails } = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [upwDetails] })

      const [result] = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails)

      expect(result.text).toEqual(upwDetails.mainOffence.description)
      expect(result.value).toEqual(upwDetails.eventNumber)
      expect(result.details).toEqual([
        { key: { text: 'Event number' }, value: { text: `${upwDetails.eventNumber}` } },
        { key: { text: 'Sentence date' }, value: { text: '15 March 2020' } },
        { key: { text: 'Status' }, value: { text: 'Being worked' } },
        { key: { text: 'Total hours ordered' }, value: { text: '4 hours' } },
        { key: { text: 'ETE hours credited' }, value: { text: '1 hour 40 minutes' } },
        { key: { text: 'ETE hours remaining' }, value: { text: '2 hours 20 minutes' } },
      ])
    })

    it('returns an array of options with selected value', () => {
      const upwDetails = unpaidWorkDetailsFactory.build()
      const { unpaidWorkDetails } = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [upwDetails] })

      const [result] = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, upwDetails.eventNumber)

      expect(result.checked).toBe(true)
    })
  })

  describe('unpaidWorkSummaryItem', () => {
    it('returns a summary item with requirement details when unpaidWorkDetails is provided', () => {
      const upwDetails = {
        details: unpaidWorkDetailsFactory.build({
          sentenceDate: '2020-03-15',
          upwStatus: 'Being worked',
        }),
        count: 2,
      }

      const result = UnpaidWorkUtils.unpaidWorkSummaryItem(upwDetails, '/change-path')

      expect(result).toEqual({
        key: {
          text: 'Requirement',
        },
        value: {
          html: `Offence: ${upwDetails.details.mainOffence.description}<br>Event number: ${upwDetails.details.eventNumber}<br>Sentence date: 15 March 2020<br>Status: Being worked`,
        },
        actions: {
          items: [
            {
              href: '/change-path',
              text: 'Change',
              visuallyHiddenText: 'requirement',
            },
          ],
        },
      })
    })

    it('returns a summary item with undefined value html when unpaidWorkDetails is undefined', () => {
      const result = UnpaidWorkUtils.unpaidWorkSummaryItem(undefined, '/change-path')

      expect(result).toEqual({
        key: {
          text: 'Requirement',
        },
        value: {
          html: undefined,
        },
        actions: {
          items: [
            {
              href: '/change-path',
              text: 'Change',
              visuallyHiddenText: 'requirement',
            },
          ],
        },
      })
    })
  })
})
