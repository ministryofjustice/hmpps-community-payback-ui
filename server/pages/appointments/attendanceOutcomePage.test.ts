import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from './attendanceOutcomePage'
import * as Utils from '../../utils/utils'

jest.mock('../../models/offender')

describe('AttendanceOutcomePage', () => {
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

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

      jest.spyOn(paths.appointments, 'attendanceOutcome')
      jest.spyOn(paths.appointments, 'projectDetails')

      const result = page.viewData(appointment, contactOutcomes)

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })

      expect(result).toEqual({
        offender,
        items: expectedItems,
        updatePath: pathWithQuery,
        backLink: pathWithQuery,
      })
    })
  })

  describe('next', () => {
    it('should return log hours link with given appointmentId', () => {
      const appointmentId = '1'
      const path = '/path'
      const page = new AttendanceOutcomePage({})

      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(path)

      expect(page.next(appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.logHours).toHaveBeenCalledWith({ appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given empty object', () => {
      const form = {}
      const { contactOutcomes } = contactOutcomesFactory.build()
      const page = new AttendanceOutcomePage({ attendanceOutcome: contactOutcomes[0].id })

      const result = page.updateForm(form, contactOutcomes)
      expect(result).toEqual({ contactOutcome: contactOutcomes[0] })
    })

    it('returns data from query given object with existing data', () => {
      const form = { startTime: '10:00', attendanceData: { penaltyTime: '01:00' } }
      const { contactOutcomes } = contactOutcomesFactory.build()
      const page = new AttendanceOutcomePage({ attendanceOutcome: contactOutcomes[0].id })

      const result = page.updateForm(form, contactOutcomes)
      expect(result).toEqual({
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        contactOutcome: contactOutcomes[0],
      })
    })
  })
})
