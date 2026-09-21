import AppointmentTypePage from './appointmentTypePage'

describe('AppointmentTypePage', () => {
  const page = new AppointmentTypePage()

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
  })
})
