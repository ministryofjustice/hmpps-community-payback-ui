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
})
