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
      const form = { key: { id: '1', type: 'type' }, data: {} }
      const contactOutcomeId = 'X23'
      const page = new AttendanceOutcomePage({ attendanceOutcome: contactOutcomeId })

      const result = page.form(form)
      expect(result).toEqual({ contactOutcomeId })
    })

    it('returns data from query given object with existing data', () => {
      const form = {
        key: { id: '1', type: 'type' },
        data: { startTime: '10:00', attendanceData: { penaltyTime: '01:00' } },
      }
      const contactOutcomeId = 'X23'
      const page = new AttendanceOutcomePage({ attendanceOutcome: contactOutcomeId })

      const result = page.form(form)
      expect(result).toEqual({
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        contactOutcomeId,
      })
    })
  })
})
