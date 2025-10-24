import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from './attendanceOutcomePage'

jest.mock('../../models/offender')

describe('AttendanceOutcomePage', () => {
  describe('validationErrors', () => {
    it('returns error when attendance outcome is empty', () => {
      const page = new AttendanceOutcomePage({} as AttendanceOutcomeBody)

      expect(page.validationErrors()).toEqual({
        attendanceOutcome: { text: 'Select an attendance outcome' },
      })
    })
  })

  describe('viewData', () => {
    it('should render the attendance outcome page', async () => {
      const appointment = appointmentFactory.build()
      const { contactOutcomes } = contactOutcomesFactory.build()
      const page = new AttendanceOutcomePage({} as AttendanceOutcomeBody)
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
      }
      offenderMock.mockImplementation(() => {
        return offender
      })

      const expectedItems = [
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
      ]

      const result = page.viewData(appointment, contactOutcomes)

      expect(result).toStrictEqual({
        offender,
        items: expectedItems,
        updatePath: paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() }),
        backLink: paths.appointments.projectDetails({ appointmentId: appointment.id.toString() }),
      })
    })
  })
})
