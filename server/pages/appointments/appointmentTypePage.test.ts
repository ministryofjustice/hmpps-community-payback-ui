import AppointmentTypePage from './appointmentTypePage'

describe('AppointmentTypePage', () => {
  const page = new AppointmentTypePage()

  describe('validationErrors', () => {
    it('returns an error when no appointment type is selected', () => {
      const result = page.validationErrors({})

      expect(result).toEqual({
        errors: { appointmentType: { text: 'Select an appointment type' } },
        hasErrors: true,
        errorSummary: [
          {
            text: 'Select an appointment type',
            href: '#appointmentType',
            attributes: { 'data-cy-error-appointmentType': 'Select an appointment type' },
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
  })
})
