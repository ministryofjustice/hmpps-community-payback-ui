import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
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

      const { contactOutcomes } = contactOutcomesFactory.build()

      expect(page.items(contactOutcomes)).toEqual([
        {
          text: contactOutcomes[0].name,
          value: contactOutcomes[0].id,
        },
        {
          text: contactOutcomes[1].name,
          value: contactOutcomes[1].id,
        },
        {
          text: contactOutcomes[2].name,
          value: contactOutcomes[2].id,
        },
      ])
    })
  })
})
