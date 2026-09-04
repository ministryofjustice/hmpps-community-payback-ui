import adjustmentFactory from '../testutils/factories/adjustmentFactory'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import AdjustmentUtils from './adjustmentUtils'

describe('AdjustmentUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getTravelTimeAdjustmentFromAppointment', () => {
    it('returns travel time adjustment when present', () => {
      const travelTimeAdjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
      })
      const appointment = appointmentFactory.build({ adjustments: [travelTimeAdjustment] })

      const result = AdjustmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)

      expect(result).toBe(travelTimeAdjustment)
    })

    it('returns null if no travel time adjustment is present', () => {
      const adjustment = adjustmentFactory.build({ reasonCode: 'XXX' })
      const appointment = appointmentFactory.build({ adjustments: [adjustment] })

      const result = AdjustmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)

      expect(result).toBeNull()
    })

    it('returns null if no adjustment is present', () => {
      const appointment = appointmentFactory.build({ adjustments: [] })

      const result = AdjustmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)

      expect(result).toBeNull()
    })
  })

  describe('getTravelTimeAdjustmentText', () => {
    it('returns null if not a travel time adjustment', () => {
      const adjustment = adjustmentFactory.build({ reasonCode: 'XXX' })

      const result = AdjustmentUtils.getTravelTimeAdjustmentText(adjustment)

      expect(result).toBeNull()
    })

    it('returns null if adjustment is undefined', () => {
      const result = AdjustmentUtils.getTravelTimeAdjustmentText(undefined)

      expect(result).toBeNull()
    })

    it('returns 1 hour if amount matches', () => {
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: 'PT-1H',
      })

      const result = AdjustmentUtils.getTravelTimeAdjustmentText(adjustment)

      expect(result).toBe('1 hour')
    })

    it('returns 2 hours if amount is not 1 hour', () => {
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: 'PT-2H',
      })

      const result = AdjustmentUtils.getTravelTimeAdjustmentText(adjustment)

      expect(result).toBe('2 hours')
    })
  })
})
