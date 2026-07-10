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
        {
          appointmentOrSession: appointment,
          contactOutcomes,
        },
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
          {
            appointmentOrSession: appointmentInTheFuture,
            contactOutcomes: [...contactOutcomes, attendedContactOutcome],
          },
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
          {
            appointmentOrSession: appointmentInTheFuture,
            contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
          },
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
          {
            appointmentOrSession: appointmentInTheFuture,
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
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
          { appointmentOrSession: sessionInTheFuture, contactOutcomes: [...contactOutcomes, attendedContactOutcome] },
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
          { appointmentOrSession: appointmentToday, contactOutcomes: [...contactOutcomes, attendedContactOutcome] },
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const query = { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          { appointmentOrSession: appointmentToday, contactOutcomes: [...contactOutcomes, enforceableContactOutcome] },
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const query = { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          {
            appointmentOrSession: appointmentToday,
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
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
          { appointmentOrSession: appointmentInThePast, contactOutcomes: [...contactOutcomes, attendedContactOutcome] },
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const query = { attendanceOutcome: enforceableContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          {
            appointmentOrSession: appointmentInThePast,
            contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const query = { attendanceOutcome: acceptableAbsenceContactOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          {
            appointmentOrSession: appointmentInThePast,
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
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
          {
            appointmentOrSession: appointment,
            contactOutcomes,
          },
        )
        expect(errors.notes).toBeFalsy()
      })

      it.each([4000, 3999, 0])('should not have any errors if notes count is less than 4000', (count: number) => {
        const notes = faker.string.alpha(count)
        const query = { notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          {
            appointmentOrSession: appointment,
            contactOutcomes,
          },
        )
        expect(errors.notes).toBeFalsy()
      })

      it('should have errors if the notes count is greater than 4000', () => {
        const notes = faker.string.alpha(4001)
        const query = { notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: query.attendanceOutcome, notes: query.notes },
          {
            appointmentOrSession: appointment,
            contactOutcomes,
          },
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
        { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
        { checked: false, text: 'No, they are not sensitive', value: 'no' },
      ]

      jest.spyOn(paths.appointments, 'update')
      const notesItems = {
        notes: 'Test notes',
        showIsSensitiveQuestion: true,
        isSensitiveItems: expectedSensitiveItems,
      }
      jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

      const result = page.viewData(formWithOutcomes, false, query, appointment, contactOutcomes)

      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'attendance-outcome',
      })
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'choose-project',
      })

      expect(NotesUtils.questionItems).toHaveBeenCalledWith({}, formWithOutcomes, appointment, true)

      expect(result).toEqual({
        heading: {
          title: offender.name,
          caption: offender.crn,
        },
        items: expectedItems,
        updatePath: pathWithQuery,
        backLink: pathWithQuery,
        notes: 'Test notes',
        isSensitiveItems: expectedSensitiveItems,
        showIsSensitiveQuestion: true,
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
        const session = sessionFactory.build()
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[1].code }),
        })
        const notesItems = { notes: 'Test notes', showIsSensitiveQuestion: false }

        jest.spyOn(paths.sessions, 'update')
        jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData(form, false, query, session, contactOutcomes)

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

        expect(paths.sessions.update).toHaveBeenCalledWith({
          projectCode: session.projectCode,
          date: session.date,
          page: 'attendance-outcome',
        })
        expect(paths.sessions.update).toHaveBeenCalledWith({
          projectCode: session.projectCode,
          date: session.date,
          page: 'choose-project',
        })

        expect(result).toEqual(
          expect.objectContaining({
            backLink: pathWithQuery,
            updatePath: pathWithQuery,
            ...notesItems,
            items: expectedItems,
          }),
        )
      })

      it('passes undefined appointment to questionItems when appointmentOrSession is a session', () => {
        const session = sessionFactory.build()
        const form = appointmentOutcomeFormFactory.build()
        const notesItems = { notes: 'some note', showIsSensitiveQuestion: false }
        const questionItemsSpy = jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const viewData = page.viewData(form, false, query, session, contactOutcomes)

        expect(questionItemsSpy).toHaveBeenCalledWith({}, form, undefined, false)
        expect(viewData).toEqual(expect.objectContaining(notesItems))
      })
    })

    describe('items', () => {
      it('should map contact outcome value as selected if no errors', () => {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        })
        const query = { attendanceOutcome: contactOutcomes[1].code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData(form, false, query, appointment, contactOutcomes)

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

        expect(result.items).toEqual(expectedItems)
      })

      it('should include hint text when a contact outcome defines it', () => {
        const hintedOutcome = contactOutcomeFactory.build({
          hintText: 'Use this when the person gave advance notice',
        })
        const query = {} as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const result = page.viewData(appointmentOutcomeFormFactory.build(), false, query, appointment, [hintedOutcome])

        expect(result.items[0]).toEqual({
          text: hintedOutcome.name,
          value: hintedOutcome.code,
          hint: { text: hintedOutcome.hintText },
          checked: false,
        })
      })

      it('should return query values if there are errors', () => {
        const notesItems = { notes: 'Test', showIsSensitiveQuestion: true }
        jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)
        const query = { notes: notesItems.notes } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()

        const form = appointmentOutcomeFormFactory.build()
        const result = page.viewData(form, true, query, appointment, contactOutcomes)

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

        const result = page.viewData(appointmentOutcomeFormFactory.build(), false, query, appointment, contactOutcomes)

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

  describe('next', () => {
    describe('when the contact outcome is attended', () => {
      it('should return log hours link with given appointmentId', () => {
        const appointmentId = '1'
        const projectCode = '2'
        const path = '/path'

        const attendedOutcome = contactOutcomeFactory.build({ attended: true })
        const query = { attendanceOutcome: attendedOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()
        const form = appointmentOutcomeFormFactory.build()

        page.updateForm(form, [attendedOutcome], query)
        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(page.next({ projectCode, appointmentId })).toBe(pathWithQuery)
        expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'log-hours' })
      })
    })
    describe('when the contact outcome is not attended', () => {
      it('should return confirm link with given appointmentId', () => {
        const appointmentId = '1'
        const projectCode = '2'
        const path = '/path'
        const notAttendedOutcome = contactOutcomeFactory.build({ attended: false })
        const query = { attendanceOutcome: notAttendedOutcome.code } as AttendanceOutcomeQuery
        const page = new AttendanceOutcomePage()
        const form = appointmentOutcomeFormFactory.build()

        page.updateForm(form, [notAttendedOutcome], query)
        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(page.next({ projectCode, appointmentId })).toBe(pathWithQuery)
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

      const result = page.updateForm(form, contactOutcomes, query)
      expect(result).toEqual({
        ...form,
        contactOutcome: contactOutcomes[0],
        notes: queryNotes,
        isSensitive: 'yes',
      })
    })
  })
})
