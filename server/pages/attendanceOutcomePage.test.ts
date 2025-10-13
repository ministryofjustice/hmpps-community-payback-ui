import AttendanceOutcomePage, { AttendanceOutcomeBody } from './attendanceOutcomePage'

describe('AttendanceOutcomePage', () => {
  describe('validationErrors', () => {
    it('returns error when attendance outcome is empty', () => {
      const page = new AttendanceOutcomePage({} as AttendanceOutcomeBody)

      expect(page.validationErrors()).toEqual({
        attendanceOutcome: { text: 'Select an attendance outcome' },
      })
    })
  })

  describe('items', () => {
    it('returns items for contact outcomes', () => {
      const page = new AttendanceOutcomePage({} as AttendanceOutcomeBody)

      const contactOutcomes = [
        { name: 'Attended', id: 'outcome-id-1', code: 'CO1' },
        { name: 'Did not attend', id: 'outcome-id-2', code: 'CO2' },
      ]

      expect(page.items(contactOutcomes)).toEqual([
        {
          text: 'Attended',
          value: 'outcome-id-1',
        },
        {
          text: 'Did not attend',
          value: 'outcome-id-2',
        },
      ])
    })
  })
})
