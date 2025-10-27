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
      const { contactOutcomes } = contactOutcomesFactory.build()
      const appointment = appointmentFactory.build({ contactOutcomeId: contactOutcomes[0].id })
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
          checked: true,
        },
        {
          text: contactOutcomes[1].name,
          value: contactOutcomes[1].id,
          checked: false,
        },
        {
          text: contactOutcomes[2].name,
          value: contactOutcomes[2].id,
          checked: false,
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

  describe('next', () => {
    it('should return log hours link with given appointmentId', () => {
      const appointmentId = '1'
      const path = '/path'
      const page = new AttendanceOutcomePage({})

      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(path)

      expect(page.next(appointmentId)).toBe(path)
      expect(paths.appointments.logHours).toHaveBeenCalledWith({ appointmentId })
    })
  })
})
