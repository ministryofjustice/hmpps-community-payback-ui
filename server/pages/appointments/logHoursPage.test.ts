import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'
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

      describe('when startTime is after endTime', () => {
        it('should return an error', () => {
          page = new LogHoursPage({ startTime: '09:00', endTime: '08:00' })
          page.validate()

          expect(page.validationErrors.startTime).toEqual({
            text: `Start time should be before 08:00`,
          })
        })
      })

      describe('when startTime is the same as endTime', () => {
        it('should return an error', () => {
          page = new LogHoursPage({ startTime: '09:00', endTime: '09:00' })
          page.validate()

          expect(page.validationErrors.startTime).toEqual({
            text: 'Start time should be before 09:00',
          })
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
      describe('when penaltyTimeHours and penaltyTimeMinutes are not present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({ penaltyTimeHours: null, penaltyTimeMinutes: null })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toBeUndefined()
          expect(page.validationErrors.penaltyTimeMinutes).toBeUndefined()
        })
      })

      describe('when one field is present without the other', () => {
        it('should return the correct error', () => {
          page = new LogHoursPage({ penaltyTimeHours: '2', penaltyTimeMinutes: null })
          page.validate()

          expect(page.validationErrors.penaltyTimeMinutes).toEqual({ text: 'Enter minutes for penalty hours' })
        })
        it('should return the correct error', () => {
          page = new LogHoursPage({ penaltyTimeHours: null, penaltyTimeMinutes: '30' })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toEqual({ text: 'Enter hours for penalty hours' })
        })
      })

      describe('when penaltyTime inputs are not valid', () => {
        it('should return an error for string inputs', () => {
          page = new LogHoursPage({ penaltyTimeHours: 'hello', penaltyTimeMinutes: 'world' })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toEqual({
            text: 'Enter valid hours for penalty hours, for example 2',
          })
          expect(page.validationErrors.penaltyTimeMinutes).toEqual({
            text: 'Enter valid minutes for penalty hours, for example 30',
          })
        })
        it('should return an error for invalid number inputs', () => {
          page = new LogHoursPage({ penaltyTimeHours: '-5', penaltyTimeMinutes: '4000' })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toEqual({
            text: 'Enter valid hours for penalty hours, for example 2',
          })
          expect(page.validationErrors.penaltyTimeMinutes).toEqual({
            text: 'Enter valid minutes for penalty hours, for example 30',
          })
        })
      })

      describe('when penaltyHours is present', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({
            startTime: '09:00',
            endTime: '13:00',
            penaltyTimeHours: '01',
            penaltyTimeMinutes: '00',
          })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toBeUndefined()
          expect(page.validationErrors.penaltyTimeMinutes).toBeUndefined()
        })
      })

      describe('when penalty time is greater than the session duration', () => {
        it('should return an error', () => {
          page = new LogHoursPage({
            startTime: '09:00',
            endTime: '10:00',
            penaltyTimeHours: '2',
            penaltyTimeMinutes: '00',
          })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toEqual({
            text: 'Number of penalty hours must be less than the length of the session',
          })
          expect(page.validationErrors.penaltyTimeMinutes).toEqual({
            text: 'Number of penalty hours must be less than the length of the session',
          })
        })
      })

      describe('when penalty time equals the session duration', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({
            startTime: '09:00',
            endTime: '10:00',
            penaltyTimeHours: '1',
            penaltyTimeMinutes: '00',
          })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toBeUndefined()
          expect(page.validationErrors.penaltyTimeMinutes).toBeUndefined()
        })
      })

      describe('when penalty time is less than the session duration', () => {
        it('should not return an error', () => {
          page = new LogHoursPage({
            startTime: '09:00',
            endTime: '10:00',
            penaltyTimeHours: '0',
            penaltyTimeMinutes: '30',
          })
          page.validate()

          expect(page.validationErrors.penaltyTimeHours).toBeUndefined()
          expect(page.validationErrors.penaltyTimeMinutes).toBeUndefined()
        })
      })
    })
  })

  describe('viewData', () => {
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new LogHoursPage()
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build({ contactOutcome: contactOutcomeFactory.build({ attended: true }) })
      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(updatePath)
    })

    it('should return an object containing start time and end time', () => {
      const result = page.viewData(appointment, form)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: form.startTime,
          endTime: form.endTime,
        }),
      )
    })

    it("should return an object containing the form's start time and end time", () => {
      const updatedForm = appointmentOutcomeFormFactory.build({
        startTime: '09:45',
        endTime: '14:35',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      const result = page.viewData(appointment, updatedForm)
      expect(result).toEqual(
        expect.objectContaining({
          startTime: updatedForm.startTime,
          endTime: updatedForm.endTime,
        }),
      )
    })

    describe('showPenaltyHours', () => {
      describe('when contact outcome is attended', () => {
        it('should return true', () => {
          const result = page.viewData(appointment, form)
          expect(result).toEqual(
            expect.objectContaining({
              showPenaltyHours: true,
            }),
          )
        })
      })

      describe('when contact outcome is not attended', () => {
        it('should return false', () => {
          form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: false }),
          })
          const result = page.viewData(appointment, form)
          expect(result).toEqual(
            expect.objectContaining({
              showPenaltyHours: false,
            }),
          )
        })
      })
    })

    describe('isOutcomeAcceptableAbsenceStoodDown', () => {
      it("should be true when contactOutcome.code is 'AASD'", () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true, code: 'AASD' }),
        })

        const result = page.viewData(appointment, form)

        expect(result.isOutcomeAcceptableAbsenceStoodDown).toBe(true)
      })

      it("should be false when contactOutcome.code is not 'AASD'", () => {
        form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: true, code: 'SOME_OTHER_CODE' }),
        })

        const result = page.viewData(appointment, form)

        expect(result.isOutcomeAcceptableAbsenceStoodDown).toBe(false)
      })
    })

    describe('penaltyHours', () => {
      describe('when contact outcome is not attended', () => {
        it('should not define penalty hours', () => {
          const contactOutcome = contactOutcomeFactory.build({ attended: false })
          form = appointmentOutcomeFormFactory.build({ contactOutcome })

          appointment = appointmentFactory.build()

          const result = page.viewData(appointment, form)
          expect(result.penaltyTimeHours).toBeUndefined()
          expect(result.penaltyTimeMinutes).toBeUndefined()
        })
      })

      describe('when form inputted penalty hours differ from appointment penalty hours', () => {
        it('should return the form penalty hours', () => {
          appointment = appointmentFactory.build({
            attendanceData: attendanceDataFactory.build({ penaltyMinutes: 60 }),
          })
          form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: true }),
            attendanceData: { penaltyMinutes: 90 },
          })

          const result = page.viewData(appointment, form)

          expect(result.penaltyTimeHours).toBe('1')
          expect(result.penaltyTimeMinutes).toBe('30')
        })
      })

      describe('when penalty hours is present', () => {
        it('should return penalty hours', () => {
          appointment = appointmentFactory.build({
            attendanceData: attendanceDataFactory.build({ penaltyMinutes: 60 }),
          })

          const result = page.viewData(appointment, form)
          expect(result.penaltyTimeHours).toBe('1')
          expect(result.penaltyTimeMinutes).toBe('00')
        })
      })
      describe('when penalty hours is not present', () => {
        it('should return null for penalty hours', () => {
          appointment = appointmentFactory.build({
            attendanceData: attendanceDataFactory.build({ penaltyMinutes: null }),
          })
          form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: true }),
            attendanceData: { penaltyMinutes: null },
          })

          const result = page.viewData(appointment, form)
          expect(result.penaltyTimeHours).toBe(null)
          expect(result.penaltyTimeMinutes).toBe(null)
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

      const result = page.viewData(appointment, form)

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the attendance outcome page', async () => {
      jest.spyOn(paths.appointments, 'attendanceOutcome')
      const result = page.viewData(appointment, form)

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return the update path for the page', () => {
      jest.spyOn(paths.appointments, 'logHours')
      const result = page.viewData(appointment, form)
      expect(paths.appointments.logHours).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })
  })

  describe('next', () => {
    it('if contact outcome attended - should return log compliance link with given appointmentId', () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome })
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      page = new LogHoursPage({})
      page.updateForm(form)

      jest.spyOn(paths.appointments, 'logCompliance').mockReturnValue(nextPath)

      const appointment = appointmentFactory.build({ id: Number(appointmentId), projectCode })
      expect(page.next(appointment)).toBe(pathWithQuery)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ projectCode, appointmentId })
    })

    it('if contact outcome not attended - should return confirm details link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const nextPath = '/path'
      const appointment = appointmentFactory.build({ projectCode, id: Number(appointmentId) })
      page = new LogHoursPage({})
      page.updateForm(
        appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ attended: false }),
        }),
      )

      jest.spyOn(paths.appointments, 'confirm').mockReturnValue(nextPath)

      expect(page.next(appointment)).toBe(pathWithQuery)
      expect(paths.appointments.confirm).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const query: LogHoursQuery = {
        startTime: '09:00',
        endTime: '13:00',
        penaltyTimeHours: '0',
        penaltyTimeMinutes: '0',
      }

      page = new LogHoursPage(query)

      const result = page.updateForm(form)

      const expected = {
        ...form,
        startTime: '09:00',
        endTime: '13:00',
        attendanceData: {
          ...form.attendanceData,
          penaltyMinutes: 0,
        },
      }

      expect(result).toEqual(expected)
    })
  })
})
