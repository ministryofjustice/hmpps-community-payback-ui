import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import { contactOutcomeFactory, contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from './attendanceOutcomePage'
import * as Utils from '../../utils/utils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'

jest.mock('../../models/offender')

describe('AttendanceOutcomePage', () => {
  const { contactOutcomes } = contactOutcomesFactory.build()
  const appointment = appointmentFactory.build()

  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('validationErrors', () => {
    it('returns error when attendance outcome is empty', () => {
      const page = new AttendanceOutcomePage({ query: {} as AttendanceOutcomeBody, appointment, contactOutcomes })

      expect(page.validationErrors()).toEqual({
        attendanceOutcome: { text: 'Select an attendance outcome' },
      })
    })

    describe('when the appointment date is in the future', () => {
      const appointmentInTheFuture = appointmentFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
      })

      it('returns error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInTheFuture,
          contactOutcomes: [...contactOutcomes, attendedContactOutcome],
        })

        expect(page.validationErrors()).toEqual({
          attendanceOutcome: {
            text: 'If the appointment is in the future, only acceptable absences are permitted to be recorded',
          },
        })
      })

      it('returns error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInTheFuture,
          contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
        })

        expect(page.validationErrors()).toEqual({
          attendanceOutcome: {
            text: 'If the appointment is in the future, only acceptable absences are permitted to be recorded',
          },
        })
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInTheFuture,
          contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })
    })

    describe('when the appointment date is today', () => {
      const appointmentToday = appointmentFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(0).formattedDate,
      })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentToday,
          contactOutcomes: [...contactOutcomes, attendedContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentToday,
          contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentToday,
          contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })
    })

    describe('when the appointment date is in the past', () => {
      const appointmentInThePast = appointmentFactory.build({ date: '2020-10-23' })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInThePast,
          contactOutcomes: [...contactOutcomes, attendedContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInThePast,
          contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeBody,
          appointment: appointmentInThePast,
          contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
        })

        expect(page.validationErrors()).toEqual({})
      })
    })
  })

  describe('viewData', () => {
    it('should render the attendance outcome page', async () => {
      const appointmentWithOutcomes = appointmentFactory.build({ contactOutcomeCode: contactOutcomes[0].code })
      const page = new AttendanceOutcomePage({
        query: {} as AttendanceOutcomeBody,
        appointment: appointmentWithOutcomes,
        contactOutcomes,
      })
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
          value: contactOutcomes[0].code,
          checked: true,
        },
        {
          text: contactOutcomes[1].name,
          value: contactOutcomes[1].code,
          checked: false,
        },
        {
          text: contactOutcomes[2].name,
          value: contactOutcomes[2].code,
          checked: false,
        },
      ]

      jest.spyOn(paths.appointments, 'attendanceOutcome')
      jest.spyOn(paths.appointments, 'projectDetails')

      const result = page.viewData()

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({
        projectCode: appointmentWithOutcomes.projectCode,
        appointmentId: appointmentWithOutcomes.id.toString(),
      })
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({
        projectCode: appointmentWithOutcomes.projectCode,
        appointmentId: appointmentWithOutcomes.id.toString(),
      })

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
      const projectCode = '2'
      const path = '/path'
      const page = new AttendanceOutcomePage({
        query: {},
        appointment,
        contactOutcomes: contactOutcomesFactory.build().contactOutcomes,
      })

      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(path)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.logHours).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const page = new AttendanceOutcomePage({
        query: { attendanceOutcome: contactOutcomes[0].code },
        appointment,
        contactOutcomes,
      })

      const result = page.updateForm(form, contactOutcomes)
      expect(result).toEqual({
        ...form,
        contactOutcome: contactOutcomes[0],
      })
    })
  })
})
