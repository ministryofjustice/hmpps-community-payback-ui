import { faker } from '@faker-js/faker'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import { contactOutcomeFactory, contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import AttendanceOutcomePage, { AttendanceOutcomeQuery } from './attendanceOutcomePage'
import * as Utils from '../../utils/utils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import NotesUtils from '../../utils/components/notesUtils'

jest.mock('../../models/offender')

describe('AttendanceOutcomePage', () => {
  const { contactOutcomes } = contactOutcomesFactory.build()
  const appointment = appointmentFactory.build({ sensitive: undefined })
  const validationContext = (date: string, outcomes = contactOutcomes) => ({
    form: appointmentOutcomeFormFactory.build({ date }),
    contactOutcomes: outcomes,
  })

  const pathWithQuery = '/path?'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('validationErrors', () => {
    it('returns error when attendance outcome is empty', () => {
      const query = {} as AttendanceOutcomeQuery
      const page = new AttendanceOutcomePage()

      const { errors } = page.validationErrors(
        { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
        validationContext(appointment.date),
      )
      expect(errors).toEqual({
        attendanceOutcome: { text: 'Select an attendance outcome' },
      })
    })

    describe('when the appointment date is in the future', () => {
      const appointmentInTheFuture = appointmentFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
      })

      it('returns error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const query = { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInTheFuture.date, [...contactOutcomes, attendedContactOutcome]),
        )
        expect(errors).toEqual({
          attendanceOutcome: {
            text: 'The outcome entered must be: acceptable absence',
          },
        })
      })

      it('returns error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const query = { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInTheFuture.date, [...contactOutcomes, enforceableContactOutcome]),
        )
        expect(errors).toEqual({
          attendanceOutcome: {
            text: 'The outcome entered must be: acceptable absence',
          },
        })
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const query = { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInTheFuture.date, [...contactOutcomes, acceptableAbsenceContactOutcome]),
        )
        expect(errors).toEqual({})
      })

      it('returns error if appointmentOrSession is a session and contact outcome is attended', () => {
        const sessionInTheFuture = sessionFactory.build({
          date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
        })
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const query = { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(sessionInTheFuture.date, [...contactOutcomes, attendedContactOutcome]),
        )
        expect(errors).toEqual({
          attendanceOutcome: {
            text: 'The outcome entered must be: acceptable absence',
          },
        })
      })
    })

    describe('when the appointment date is today', () => {
      const appointmentToday = appointmentFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(0).formattedDate,
      })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const query = { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentToday.date, [...contactOutcomes, attendedContactOutcome]),
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const query = { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentToday.date, [...contactOutcomes, enforceableContactOutcome]),
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const query = { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentToday.date, [...contactOutcomes, acceptableAbsenceContactOutcome]),
        )
        expect(errors).toEqual({})
      })
    })

    describe('when the appointment date is in the past', () => {
      const appointmentInThePast = appointmentFactory.build({ date: '2020-10-23' })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const query = { attendanceOutcome: attendedContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInThePast.date, [...contactOutcomes, attendedContactOutcome]),
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const query = { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInThePast.date, [...contactOutcomes, enforceableContactOutcome]),
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const query = { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointmentInThePast.date, [...contactOutcomes, acceptableAbsenceContactOutcome]),
        )
        expect(errors).toEqual({})
      })
    })

    describe('notes', () => {
      it('should not have any errors if no notes value', () => {
        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointment.date),
        )
        expect(errors.notes).toBeFalsy()
      })

      it.each([4000, 3999, 0])('should not have any errors if notes count is less than 4000', (count: number) => {
        const notes = faker.string.alpha(count)
        const query = { notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointment.date),
        )
        expect(errors.notes).toBeFalsy()
      })

      it('should have errors if the notes count is greater than 4000', () => {
        const notes = faker.string.alpha(4001)
        const query = { notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          validationContext(appointment.date),
        )
        expect(errors.notes).toEqual({
          text: 'Notes must be 4000 characters or less',
        })
      })
    })
  })

  describe('viewData', () => {
    it('returns view data for an appointment', async () => {
      const formWithOutcomes = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        notes: 'Test notes',
        isSensitive: undefined,
      })
      const query = {} as AttendanceOutcomeQuery
      const page = new AttendanceOutcomePage()
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

      const expectedSensitiveItems = [
        {
          checked: false,
          text: 'This is information that you believe must be recorded but not shared with a person on probation. If they make a request for their record, the Data Protection Team will decide whether the information can be shared.',
          value: 'yes',
          label: { classes: 'govuk-!-padding-top-0' },
        },
      ]

      jest.spyOn(paths.appointments, 'update')
      const notesItems = {
        notes: 'Test notes',
        isSensitiveItem: expectedSensitiveItems,
      }
      jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

      const result = page.viewData({
        form: formWithOutcomes,
        query,
        appointment,
        contactOutcomes,
        isSingleAppointment: true,
      })

      expect(NotesUtils.questionItems).toHaveBeenCalledWith({}, formWithOutcomes, appointment, true)

      expect(result).toEqual({
        items: expectedItems,
        notes: 'Test notes',
        isSensitiveItem: expectedSensitiveItems,
      })
    })

    describe('given a session', () => {
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
      const offender = {
        name: 'Sam Smith',
        crn: 'CRN123',
        isLimited: false,
        details: {
          description: 'description',
        },
      }
      beforeEach(() => {
        offenderMock.mockImplementation(() => offender)
      })

      it('returns view data for a session', () => {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[1].code }),
        })
        const notesItems = { notes: 'Test notes', sensitiveInfoContent: NotesUtils.sensitiveInfoContentDontInclude }

        jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData({
          form,
          query,
          contactOutcomes,
          isSingleAppointment: false,
        })

        const expectedItems = [
          {
            text: contactOutcomes[0].name,
            value: contactOutcomes[0].code,
            checked: false,
          },
          {
            text: contactOutcomes[1].name,
            value: contactOutcomes[1].code,
            checked: true,
          },
          {
            text: contactOutcomes[2].name,
            value: contactOutcomes[2].code,
            checked: false,
          },
        ]

        expect(result).toEqual(
          expect.objectContaining({
            ...notesItems,
            items: expectedItems,
          }),
        )
      })

      it('passes undefined appointment to questionItems when appointmentOrSession is a session', () => {
        const form = appointmentOutcomeFormFactory.build()
        const notesItems = { notes: 'some note', sensitiveInfoContent: NotesUtils.sensitiveInfoContentDontInclude }
        const questionItemsSpy = jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const viewData = page.viewData({
          form,
          query,
          contactOutcomes,
          isSingleAppointment: false,
        })

        expect(questionItemsSpy).toHaveBeenCalledWith({}, form, undefined, false)
        expect(viewData).toEqual(expect.objectContaining(notesItems))
      })
    })

    describe('items', () => {
      it('should map query contact outcome value as selected when provided', () => {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        })
        const query = { attendanceOutcome: contactOutcomes[1].code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData({
          form,
          query,
          appointment,
          contactOutcomes,
          isSingleAppointment: true,
        })

        const expectedItems = [
          {
            text: contactOutcomes[0].name,
            value: contactOutcomes[0].code,
            checked: false,
          },
          {
            text: contactOutcomes[1].name,
            value: contactOutcomes[1].code,
            checked: true,
          },
          {
            text: contactOutcomes[2].name,
            value: contactOutcomes[2].code,
            checked: false,
          },
        ]

        expect(result.items).toEqual(expectedItems)
      })

      it('should include hint text when a contact outcome defines it', () => {
        const hintedOutcome = contactOutcomeFactory.build({
          hintText: 'Use this when the person gave advance notice',
        })
        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData({
          form: appointmentOutcomeFormFactory.build(),
          query,
          appointment,
          contactOutcomes: [hintedOutcome],
          isSingleAppointment: true,
        })

        expect(result.items[0]).toEqual({
          text: hintedOutcome.name,
          value: hintedOutcome.code,
          hint: { text: hintedOutcome.hintText },
          checked: false,
        })
      })

      it('should return query values if there are errors', () => {
        const notesItems = {
          notes: 'Test',
          isSensitiveItem: [
            {
              text: 'This is information that you believe must be recorded but not shared with a person on probation. If they make a request for their record, the Data Protection Team will decide whether the information can be shared.',
              value: 'yes',
              checked: false,
              label: { classes: 'govuk-!-padding-top-0' },
            },
          ],
        }
        jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)
        const query = { notes: notesItems.notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const form = appointmentOutcomeFormFactory.build()
        const result = page.viewData({
          form,
          query,
          appointment,
          contactOutcomes,
          isSingleAppointment: true,
        })

        const expectedItems = [
          {
            text: contactOutcomes[0].name,
            value: contactOutcomes[0].code,
            checked: false,
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

        expect(result.items).toEqual(expectedItems)
        expect(result.notes).toEqual(notesItems.notes)
        expect(NotesUtils.questionItems).toHaveBeenCalledWith(query, form, appointment, true)
      })

      it('should return items if page has Errors and contact outcome is undefined', () => {
        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData({
          form: appointmentOutcomeFormFactory.build(),
          query,
          appointment,
          contactOutcomes,
          isSingleAppointment: true,
        })

        const expectedItems = [
          {
            text: contactOutcomes[0].name,
            value: contactOutcomes[0].code,
            checked: false,
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

        expect(result.items).toEqual(expectedItems)
      })
    })
  })

  describe('paths', () => {
    it('returns backLink and updatePath for an appointment', () => {
      const page = new AttendanceOutcomePage()
      const formId = 'form-123'

      const result = page.paths({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        date: appointment.date,
        formId,
        form: appointmentOutcomeFormFactory.build(),
      })

      expect(result).toHaveProperty('backLink')
      expect(result).toHaveProperty('updatePath')
    })
  })

  describe('next', () => {
    describe('when the contact outcome is attended', () => {
      it('should return log hours link with given appointmentId', () => {
        const appointmentId = '1'
        const projectCode = '2'
        const path = '/path'

        const attendedOutcome = contactOutcomeFactory.build({ attended: true })
        const page = new AttendanceOutcomePage()
        const form = appointmentOutcomeFormFactory.build({ contactOutcome: attendedOutcome })

        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(page.next({ projectCode, appointmentId, form })).toBe(pathWithQuery)
        expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'log-hours' })
      })
    })
    describe('when the contact outcome is not attended', () => {
      it('should return confirm link with given appointmentId', () => {
        const appointmentId = '1'
        const projectCode = '2'
        const path = '/path'
        const notAttendedOutcome = contactOutcomeFactory.build({ attended: false })
        const page = new AttendanceOutcomePage()
        const form = appointmentOutcomeFormFactory.build({ contactOutcome: notAttendedOutcome })

        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(page.next({ projectCode, appointmentId, form })).toBe(pathWithQuery)
        expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
      })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const appointmentNotes = 'Existing notes'
      const queryNotes = 'New notes'
      const form = appointmentOutcomeFormFactory.build({ notes: appointmentNotes })
      const query = {
        attendanceOutcome: contactOutcomes[0].code,
        notes: queryNotes,
        isSensitive: 'yes',
      } as AttendanceOutcomeQuery
      const page = new AttendanceOutcomePage()

      const result = page.updateForm(form, query, { contactOutcomes, form })
      expect(result).toEqual({
        ...form,
        contactOutcome: contactOutcomes[0],
        notes: queryNotes,
        isSensitive: 'yes',
      })
    })
  })
})
