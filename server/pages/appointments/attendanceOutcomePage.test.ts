import { faker } from '@faker-js/faker'
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
            text: 'The outcome entered must be: acceptable absence',
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
            text: 'The outcome entered must be: acceptable absence',
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

    describe('notes', () => {
      it('should not have any errors if no notes value', () => {
        const page = new AttendanceOutcomePage({
          query: {} as AttendanceOutcomeBody,
          appointment,
          contactOutcomes,
        })
        page.validationErrors()

        expect(page.validationErrors().notes).toBeFalsy()
      })

      it.each([4000, 3999, 0])('should not have any errors if notes count is less than 4000', (count: number) => {
        const notes = faker.string.alpha(count)
        const page = new AttendanceOutcomePage({
          query: { notes } as AttendanceOutcomeBody,
          appointment,
          contactOutcomes,
        })
        page.validationErrors()

        expect(page.validationErrors().notes).toBeFalsy()
      })

      it('should have errors if the notes count is greater than 4000', () => {
        const notes = faker.string.alpha(4001)
        const page = new AttendanceOutcomePage({
          query: { notes } as AttendanceOutcomeBody,
          appointment,
          contactOutcomes,
        })
        page.validationErrors()

        expect(page.validationErrors().notes).toEqual({
          text: 'Notes must be 4000 characters or less',
        })
      })
    })
  })

  describe('viewData', () => {
    it('should render the attendance outcome page', async () => {
      const formWithOutcomes = appointmentOutcomeFormFactory.build({
        contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        notes: 'Test notes',
      })
      const page = new AttendanceOutcomePage({
        query: {} as AttendanceOutcomeBody,
        appointment,
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

      const expectedSensitiveItems = [
        { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
        { checked: false, text: 'No, they are not sensitive', value: 'no' },
      ]

      jest.spyOn(paths.appointments, 'attendanceOutcome')
      jest.spyOn(paths.appointments, 'projectDetails')

      const result = page.viewData(formWithOutcomes)

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })

      expect(result).toEqual({
        offender,
        items: expectedItems,
        updatePath: pathWithQuery,
        backLink: pathWithQuery,
        notes: 'Test notes',
        isSensitiveItems: expectedSensitiveItems,
      })
    })

    describe('items', () => {
      it('should map contact outcome value as selected if no errors', () => {
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome: contactOutcomeFactory.build({ code: contactOutcomes[0].code }),
        })
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: contactOutcomes[1].code },
          appointment,
          contactOutcomes,
        })

        const result = page.viewData(form)

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

      it('should return query values if there are errors', () => {
        const page = new AttendanceOutcomePage({
          query: { attendanceOutcome: null, notes: 'Test' },
          appointment,
          contactOutcomes,
        })

        const result = page.viewData(appointmentOutcomeFormFactory.build(), true)

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
        expect(result.notes).toEqual('Test')
      })

      it('should return items if page has Errors and contact outcome is undefined', () => {
        const page = new AttendanceOutcomePage({
          query: {},
          appointment,
          contactOutcomes,
        })
        page.validationErrors()

        const result = page.viewData(appointmentOutcomeFormFactory.build())

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

    describe('isSensitiveItems', () => {
      it('Yes should be checked if form `sensitive` property is true', () => {
        const form = appointmentOutcomeFormFactory.build({
          sensitive: true,
        })
        const page = new AttendanceOutcomePage({
          query: {},
          appointment,
          contactOutcomes,
        })

        const result = page.viewData(form)

        const expectedSensitiveItems = [
          { checked: true, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: false, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
      })

      it('No should be checked if form `sensitive` property is false', () => {
        const form = appointmentOutcomeFormFactory.build({
          sensitive: false,
        })
        const page = new AttendanceOutcomePage({
          query: {},
          appointment,
          contactOutcomes,
        })

        const result = page.viewData(form)

        const expectedSensitiveItems = [
          { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: true, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
      })

      it.each([null, undefined])(
        'Neither value should be checked if form `sensitive` property is null or undefined',
        (isSensitive?: boolean) => {
          const form = appointmentOutcomeFormFactory.build({
            sensitive: isSensitive,
          })
          const page = new AttendanceOutcomePage({
            query: {},
            appointment,
            contactOutcomes,
          })

          const result = page.viewData(form)

          const expectedSensitiveItems = [
            { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
            { checked: false, text: 'No, they are not sensitive', value: 'no' },
          ]

          expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
        },
      )

      it('populates view data with query value if defined', () => {
        const form = appointmentOutcomeFormFactory.build({
          sensitive: false,
        })

        const page = new AttendanceOutcomePage({
          query: { isSensitive: 'yes' },
          appointment,
          contactOutcomes,
        })

        const result = page.viewData(form)

        const expectedSensitiveItems = [
          { checked: true, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: false, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
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
      const appointmentNotes = 'Existing notes'
      const queryNotes = 'New notes'
      const form = appointmentOutcomeFormFactory.build({ notes: appointmentNotes })
      const page = new AttendanceOutcomePage({
        query: { attendanceOutcome: contactOutcomes[0].code, notes: queryNotes },
        appointment,
        contactOutcomes,
      })

      const result = page.updateForm(form, contactOutcomes)
      expect(result).toEqual({
        ...form,
        contactOutcome: contactOutcomes[0],
        notes: queryNotes,
      })
    })
  })
})
