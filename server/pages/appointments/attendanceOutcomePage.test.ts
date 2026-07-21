import { faker } from '@faker-js/faker'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import { contactOutcomeFactory, contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import AttendanceOutcomePage, { AttendanceOutcomeBody } from './attendanceOutcomePage'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
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
      const page = new AttendanceOutcomePage()

      const { errors } = page.validationErrors(
        { attendanceOutcome: '', notes: 'some note' },
        {
          form: appointmentOutcomeFormFactory.build(),
          contactOutcomes,
        },
      )
      expect(errors).toEqual({
        attendanceOutcome: { text: 'Select an attendance outcome' },
      })
    })

    describe('when the appointment date is in the future', () => {
      const appointmentFormInTheFuture = appointmentOutcomeFormFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
      })

      it('returns error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: attendedContactOutcome.code, notes: '' },
          {
            form: appointmentFormInTheFuture,
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
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: enforceableContactOutcome.code, notes: '' },
          {
            form: appointmentFormInTheFuture,
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
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: acceptableAbsenceContactOutcome.code, notes: '' },
          {
            form: appointmentFormInTheFuture,
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })

      it('returns error if appointmentOrSession is a session and contact outcome is attended', () => {
        const sessionFormInTheFuture = appointmentOutcomeFormFactory.build({
          date: DateTimeFormats.getTodaysDatePlusDays(1).formattedDate,
        })
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: attendedContactOutcome.code, notes: '' },
          { form: sessionFormInTheFuture, contactOutcomes: [...contactOutcomes, attendedContactOutcome] },
        )
        expect(errors).toEqual({
          attendanceOutcome: {
            text: 'The outcome entered must be: acceptable absence',
          },
        })
      })
    })

    describe('when the appointment date is today', () => {
      const appointmentFormToday = appointmentOutcomeFormFactory.build({
        date: DateTimeFormats.getTodaysDatePlusDays(0).formattedDate,
      })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: attendedContactOutcome.code, notes: '' },
          { form: appointmentFormToday, contactOutcomes: [...contactOutcomes, attendedContactOutcome] },
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: enforceableContactOutcome.code, notes: 'note' },
          { form: appointmentFormToday, contactOutcomes: [...contactOutcomes, enforceableContactOutcome] },
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: acceptableAbsenceContactOutcome.code, notes: '' },
          {
            form: appointmentFormToday,
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })
    })

    describe('when the appointment date is in the past', () => {
      const appointmentFormInThePast = appointmentOutcomeFormFactory.build({ date: '2020-10-23' })

      it('does not return error if contact outcome is an attended outcome', () => {
        const attendedContactOutcome = contactOutcomeFactory.build({ attended: true, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: attendedContactOutcome.code, notes: '' },
          {
            form: appointmentFormInThePast,
            contactOutcomes: [...contactOutcomes, attendedContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })

      it('does not return error if contact outcome is an enforceable outcome', () => {
        const enforceableContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: true })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: enforceableContactOutcome.code, notes: '' },
          {
            form: appointmentOutcomeFormFactory.build(),
            contactOutcomes: [...contactOutcomes, enforceableContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })

      it('does not return an error if contact outcome is not enforceable or attended', () => {
        const acceptableAbsenceContactOutcome = contactOutcomeFactory.build({ attended: false, enforceable: false })
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: acceptableAbsenceContactOutcome.code, notes: '' },
          {
            form: appointmentOutcomeFormFactory.build(),
            contactOutcomes: [...contactOutcomes, acceptableAbsenceContactOutcome],
          },
        )
        expect(errors).toEqual({})
      })
    })

    describe('notes', () => {
      it('should not have any errors if no notes value', () => {
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: contactOutcomes[0].code, notes: '' },
          {
            form: appointmentOutcomeFormFactory.build(),
            contactOutcomes,
          },
        )
        expect(errors.notes).toBeFalsy()
      })

      it.each([4000, 3999, 0])('should not have any errors if notes count is less than 4000', (count: number) => {
        const notes = faker.string.alpha(count)
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: contactOutcomes[0].code, notes },
          {
            form: appointmentOutcomeFormFactory.build(),
            contactOutcomes,
          },
        )
        expect(errors.notes).toBeFalsy()
      })

      it('should have errors if the notes count is greater than 4000', () => {
        const notes = faker.string.alpha(4001)
        const page = new AttendanceOutcomePage()

        const { errors } = page.validationErrors(
          { attendanceOutcome: contactOutcomes[0].code, notes },
          {
            form: appointmentOutcomeFormFactory.build(),
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

      const result = page.viewData(appointment, formWithOutcomes, contactOutcomes, {} as AttendanceOutcomeBody)

      expect(NotesUtils.questionItems).toHaveBeenCalledWith({}, formWithOutcomes, appointment, true)

      expect(result).toEqual({
        items: expectedItems,
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

        jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const page = new AttendanceOutcomePage()

        const result = page.viewData(session, form, contactOutcomes, {} as AttendanceOutcomeBody)

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
        const session = sessionFactory.build()
        const form = appointmentOutcomeFormFactory.build()
        const notesItems = { notes: 'some note', showIsSensitiveQuestion: false }
        const questionItemsSpy = jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

        const page = new AttendanceOutcomePage()

        const viewData = page.viewData(session, form, contactOutcomes, {} as AttendanceOutcomeBody)

        expect(questionItemsSpy).toHaveBeenCalledWith({}, form, undefined, false)
        expect(viewData).toEqual(expect.objectContaining(notesItems))
      })
    })

    describe('items', () => {
      it('should map contact outcome value as selected if no errors', () => {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        })
        const page = new AttendanceOutcomePage()

        const result = page.viewData(appointment, form, contactOutcomes, {} as AttendanceOutcomeBody)

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
        const page = new AttendanceOutcomePage()

        const result = page.viewData(
          appointment,
          appointmentOutcomeFormFactory.build(),
          [hintedOutcome],
          {} as AttendanceOutcomeBody,
        )

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
        const query = { notes: notesItems.notes } as AttendanceOutcomeBody
        const page = new AttendanceOutcomePage()

        const form = appointmentOutcomeFormFactory.build()
        const result = page.viewData(appointment, form, contactOutcomes, query)

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
        const page = new AttendanceOutcomePage()
        page.validationErrors({} as AttendanceOutcomeBody, {
          form: appointmentOutcomeFormFactory.build(),
          contactOutcomes,
        })

        const result = page.viewData(
          appointment,
          appointmentOutcomeFormFactory.build(),
          contactOutcomes,
          {} as AttendanceOutcomeBody,
        )

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

  describe('commonViewData', () => {
    let form: AppointmentOutcomeForm

    beforeEach(() => {
      form = appointmentOutcomeFormFactory.build()
    })

    it('should return a back link to the choose supervisor page', () => {
      const page = new AttendanceOutcomePage()
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({
        pathData: {
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          date: '2026-01-20',
        },
        appointmentOrSession: appointment,
        form,
        formId: 'formId',
      })

      expect(result.backLink).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'choose-project',
      })
    })

    it('should return an update path for the attendance outcome page', () => {
      const page = new AttendanceOutcomePage()
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({
        pathData: {
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          date: '2026-01-20',
        },
        appointmentOrSession: appointment,
        form,
        formId: 'formId',
      })

      expect(result.updatePath).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
        page: 'attendance-outcome',
      })
    })

    it('should use session paths when appointmentOrSession is a session', () => {
      const page = new AttendanceOutcomePage()
      const pathData = { projectCode: 'P123', date: '2026-06-10' }
      const session = sessionFactory.build(pathData)

      jest.spyOn(paths.sessions, 'update')
      jest.spyOn(paths.appointments, 'update')

      const result = page.commonViewData({ pathData, appointmentOrSession: session, form, formId: 'formId' })

      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'choose-project',
      })
      expect(paths.sessions.update).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        date: session.date,
        page: 'attendance-outcome',
      })
      expect(paths.appointments.update).not.toHaveBeenCalled()
      expect(result.backLink).toBe(pathWithQuery)
      expect(result.updatePath).toBe(pathWithQuery)
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

        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(
          page.next({
            projectCode,
            appointmentId,
            form: appointmentOutcomeFormFactory.build({ contactOutcome: attendedOutcome }),
          }),
        ).toBe(pathWithQuery)
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

        jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

        expect(
          page.next({
            projectCode,
            appointmentId,
            form: appointmentOutcomeFormFactory.build({ contactOutcome: notAttendedOutcome }),
          }),
        ).toBe(pathWithQuery)
        expect(paths.appointments.update).toHaveBeenCalledWith({ projectCode, appointmentId, page: 'confirm-details' })
      })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const appointmentNotes = 'Existing notes'
      const queryNotes = 'New notes'
      const form = appointmentOutcomeFormFactory.build({ notes: appointmentNotes })
      const page = new AttendanceOutcomePage()
      const result = page.updateForm(
        form,
        { attendanceOutcome: contactOutcomes[0].code, notes: queryNotes, isSensitive: 'yes' },
        { contactOutcomes, form },
      )
      expect(result).toEqual({
        ...form,
        contactOutcome: contactOutcomes[0],
        notes: queryNotes,
        isSensitive: 'yes',
      })
    })
  })
})
