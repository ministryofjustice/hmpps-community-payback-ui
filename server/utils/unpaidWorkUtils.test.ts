import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import UnpaidWorkUtils from './unpaidWorkUtils'

describe('UnpaidWorkUtils', () => {
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
      expect(result.hint.html).toEqual(
        `Event number: ${upwDetails.eventNumber}<br>Sentence date: 15 March 2020<br>Total hours ordered: 4 hours<br>ETE hours credited: 1 hour 40 minutes<br>ETE hours remaining: 2 hours 20 minutes<br>Status: Being worked`,
      )
    })

    it('returns an array of options with selected value', () => {
      const upwDetails = unpaidWorkDetailsFactory.build()
      const { unpaidWorkDetails } = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [upwDetails] })

      const [result] = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, upwDetails.eventNumber)

      expect(result.checked).toBe(true)
    })
  })
})
