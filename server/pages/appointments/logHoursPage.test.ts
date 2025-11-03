import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogHoursPage, { LogHoursQuery } from './logHoursPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

jest.mock('../../models/offender')

describe('LogHoursPage', () => {
  let page: LogHoursPage
  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('validate', () => {
    describe('startTime', () => {
      describe('when startTime is not present', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ startTime: null })
          page.validate()

          expect(page.validationErrors.startTime).toEqual({
            text: 'Enter a start time',
          })
        })
      })

      describe('when startTime is not valid', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ startTime: '8475438' })
          page.validate()

          expect(page.validationErrors.startTime).toEqual({
            text: 'Enter a valid start time, for example 09:00',
          })
        })
      })

      describe('when startTime is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({ startTime: '09:00' })
          page.validate()

          expect(page.validationErrors.startTime).toBeUndefined()
        })
      })
    })

    describe('endTime', () => {
      describe('when endTime is not present', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ endTime: null })
          page.validate()

          expect(page.validationErrors.endTime).toEqual({
            text: 'Enter an end time',
          })
        })
      })

      describe('when endTime is not valid', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ endTime: '837:02' })
          page.validate()

          expect(page.validationErrors.endTime).toEqual({
            text: 'Enter a valid end time, for example 17:00',
          })
        })
      })

      describe('when endTime is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({ endTime: '17:00' })
          page.validate()

          expect(page.validationErrors.endTime).toBeUndefined()
        })
      })
    })

    describe('penaltyHours', () => {
      describe('when penaltyHours is not present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({ penaltyHours: null })
          page.validate()

          expect(page.validationErrors.penaltyHours).toBeUndefined()
        })
      })

      describe('when penaltyHours is not valid', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ penaltyHours: '837:02' })
          page.validate()

          expect(page.validationErrors.penaltyHours).toEqual({
            text: 'Enter a valid time for penalty hours, for example 01:00',
          })
        })
      })

      describe('when penaltyHours is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({ penaltyHours: '01:00' })
          page.validate()

          expect(page.validationErrors.penaltyHours).toBeUndefined()
        })
      })
    })
  })

  describe('viewData', () => {
    let appointment: AppointmentDto
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new LogHoursPage()
      appointment = appointmentFactory.build()
      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(updatePath)
    })

    it('should return an object containing start time and end time', () => {
      const result = page.viewData(appointment)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: appointment.startTime,
          endTime: appointment.endTime,
        }),
      )
    })

    describe('penaltyHours', () => {
      describe('when penalty hours is present', () => {
        it('should return penalty hours', () => {
          appointment = appointmentFactory.build({ attendanceData: { penaltyTime: '01:00:00' } })

          const result = page.viewData(appointment)
          expect(result.penaltyHours).toBe('01:00')
        })
      })
      describe('when penalty hours is not present', () => {
        it('should return null for penalty hours', () => {
          appointment = appointmentFactory.build({ attendanceData: { penaltyTime: null } })

          const result = page.viewData(appointment)
          expect(result.penaltyHours).toBe(null)
        })
      })
    })

    it('should return an object containing offender', () => {
      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
      }

      offenderMock.mockImplementation(() => {
        return offender
      })

      const result = page.viewData(appointment)

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the attendance outcome page', async () => {
      jest.spyOn(paths.appointments, 'attendanceOutcome')
      const result = page.viewData(appointment)

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return the update path for the page', () => {
      jest.spyOn(paths.appointments, 'logHours')
      const result = page.viewData(appointment)
      expect(paths.appointments.logHours).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })
  })

  describe('next', () => {
    it('if contact outcome attended - should return log compliance link with given appointmentId', () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })
      const appointmentId = '1'
      const nextPath = '/path'
      page = new LogHoursPage({})
      page.updateForm(form)

      jest.spyOn(paths.appointments, 'logCompliance').mockReturnValue(nextPath)

      expect(page.next(appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId })
    })

    it('if contact outcome not attended and enforceable - should return enforcement link', () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })
      const appointmentId = '1'
      const nextPath = '/path'
      page = new LogHoursPage({})
      page.updateForm(form)

      jest.spyOn(paths.appointments, 'enforcement').mockReturnValue(nextPath)

      expect(page.next(appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.enforcement).toHaveBeenCalledWith({ appointmentId })
    })

    it('if contact outcome not attended - should return confirm details link with given appointmentId', () => {
      const appointmentId = '1'
      const nextPath = '/path'
      page = new LogHoursPage({})
      page.updateForm({ contactOutcome: contactOutcomeFactory.build({ enforceable: false, attended: false }) })

      jest.spyOn(paths.appointments, 'confirm').mockReturnValue(nextPath)

      expect(page.next(appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({ appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given empty object', () => {
      const form = {}

      const query: LogHoursQuery = {
        startTime: '09:00',
        endTime: '13:00',
        penaltyHours: '1:00',
      }

      page = new LogHoursPage(query)

      const result = page.updateForm(form)

      const expected = {
        startTime: '09:00',
        endTime: '13:00',
        attendanceData: {
          penaltyTime: '1:00',
        },
      } as AppointmentOutcomeForm

      expect(result).toEqual(expected)
    })

    it('returns data from query given object with existing data', () => {
      const form = {
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        notes: 'worked',
      } as AppointmentOutcomeForm
      const query: LogHoursQuery = {
        startTime: '09:00',
        endTime: '13:00',
        penaltyHours: '',
      }

      page = new LogHoursPage(query)

      const result = page.updateForm(form)

      const expected = {
        startTime: '09:00',
        endTime: '13:00',
        attendanceData: {
          penaltyTime: '',
        },
        notes: 'worked',
      } as AppointmentOutcomeForm

      expect(result).toEqual(expected)
    })
  })
})
