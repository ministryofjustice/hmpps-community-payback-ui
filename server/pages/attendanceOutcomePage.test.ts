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
})
