import AppointmentTypePage from './appointmentTypePage'
import config from '../../config'

describe('AppointmentTypePage', () => {
  const page = new AppointmentTypePage()
  const originalOtherEteEnabled = config.featureFlags.otherEteEnabled

  afterEach(() => {
    config.featureFlags.otherEteEnabled = originalOtherEteEnabled
  })

  describe('validationErrors', () => {
    it('returns an error when no appointment type is selected', () => {
      const result = page.validationErrors({})

      expect(result).toEqual({
        errors: { appointmentType: { text: 'Select type of appointment' } },
        hasErrors: true,
        errorSummary: [
          {
            text: 'Select type of appointment',
            href: '#appointmentType',
            attributes: { 'data-cy-error-appointmentType': 'Select type of appointment' },
          },
        ],
      })
    })

    it('returns no errors when an appointment type is selected', () => {
      const result = page.validationErrors({ appointmentType: 'GROUP' })

      expect(result).toEqual({
        errors: {},
        hasErrors: false,
        errorSummary: [],
      })
    })

    it('returns no errors when OTHER_ETE is selected and the otherEteEnabled flag is on', () => {
      config.featureFlags.otherEteEnabled = true

      const result = page.validationErrors({ appointmentType: 'OTHER_ETE' })

      expect(result).toEqual({
        errors: {},
        hasErrors: false,
        errorSummary: [],
      })
    })

    it('returns an error when OTHER_ETE is selected and the otherEteEnabled flag is off', () => {
      config.featureFlags.otherEteEnabled = false

      const result = page.validationErrors({ appointmentType: 'OTHER_ETE' })

      expect(result).toEqual({
        errors: { appointmentType: { text: 'Select type of appointment' } },
        hasErrors: true,
        errorSummary: [
          {
            text: 'Select type of appointment',
            href: '#appointmentType',
            attributes: { 'data-cy-error-appointmentType': 'Select type of appointment' },
          },
        ],
      })
    })
  })
})
