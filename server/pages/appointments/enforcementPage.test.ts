import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import EnforcementPage from './enforcementPage'
import * as Utils from '../../utils/utils'
import { enforcementActionsFactory } from '../../testutils/factories/enforcementActionFactory'
import GovukFrontendDateInput from '../../forms/GovukFrontendDateInput'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

jest.mock('../../models/offender')

describe('EnforcementPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: EnforcementPage
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const pathWithQuery = '/path?'

    beforeEach(() => {
      page = new EnforcementPage({})
      appointment = appointmentFactory.build()
      form = appointmentOutcomeFormFactory.build()
      jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
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

    it('should return an object containing a back link to compliance if attended', async () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const attendedForm = appointmentOutcomeFormFactory.build({ contactOutcome })
      jest.spyOn(paths.appointments, 'logCompliance')

      const result = page.viewData(appointment, attendedForm)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing a back link to log hours if not attended', async () => {
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const notAttendedForm = appointmentOutcomeFormFactory.build({ contactOutcome })
      jest.spyOn(paths.appointments, 'logHours')

      const result = page.viewData(appointment, notAttendedForm)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'enforcement')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.enforcement).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return an object containing date items', () => {
      const dateItems = [
        { name: 'day', classes: '', value: '07' },
        { name: 'month', classes: '', value: '08' },
      ]

      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)

      const result = page.viewData(appointment, form)
      expect(result.dateItems).toEqual(dateItems)
    })

    it('should set the respond by date to 7 days from now', () => {
      const date = { day: '09', month: '10', year: '2025', formattedDate: '2025-01-01' }
      jest.spyOn(DateTimeFormats, 'getTodaysDatePlusDays').mockReturnValue(date)
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate')

      page.viewData(appointment, form)
      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenCalledWith(date, false)
    })
  })

  describe('validationErrors', () => {
    it('has no errors if all required fields have value', () => {
      const query = {
        enforcement: 'x',
        'respondBy-day': '07',
        'respondBy-month': '08',
        'respondBy-year': '2025',
      }

      const page = new EnforcementPage(query)
      page.validate()

      expect(page.hasErrors).toBe(false)
      expect(page.validationErrors).toEqual({})
    })

    describe('respondBy Date', () => {
      it('returns errors when date is empty', () => {
        const page = new EnforcementPage({})
        page.validate()

        expect(page.hasErrors).toBe(true)
        expect(page.validationErrors).toEqual({
          'respondBy-day': { text: 'The date to respond by must include a day, month and year' },
        })
      })

      it('returns errors when date is invalid', () => {
        const page = new EnforcementPage({
          'respondBy-day': '11',
          'respondBy-month': '13',
          'respondBy-year': '2025',
        })

        page.validate()

        expect(page.hasErrors).toBe(true)

        expect(page.validationErrors).toEqual({
          'respondBy-day': { text: 'The date to respond by must be a valid date' },
        })
      })
    })
  })

  describe('form', () => {
    it('returns data with refer to manager enforcement from query given empty object', () => {
      const form = {}
      const { enforcementActions } = enforcementActionsFactory.build()
      const page = new EnforcementPage({})

      const result = page.updateForm(form, enforcementActions)
      expect(result.enforcement.action.code).toEqual(EnforcementPage.offenderManagerCode)
    })

    it('returns data from query given object with existing data', () => {
      const form = { startTime: '10:00', attendanceData: { penaltyTime: '01:00' } } as AppointmentOutcomeForm
      const { enforcementActions } = enforcementActionsFactory.build()
      const page = new EnforcementPage({})

      const result = page.updateForm(form, enforcementActions)
      expect(result).toEqual({
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        enforcement: {
          action: expect.objectContaining({ code: EnforcementPage.offenderManagerCode }),
          respondBy: undefined,
        },
      })
    })

    it('includes respond by date in form data if value', () => {
      const form = {}
      const page = new EnforcementPage({
        'respondBy-day': '07',
        'respondBy-month': '08',
        'respondBy-year': '2025',
      })

      const { enforcementActions } = enforcementActionsFactory.build()

      const result = page.updateForm(form, enforcementActions)
      expect(result).toEqual({ enforcement: expect.objectContaining({ respondBy: '2025-08-07' }) })
    })
  })
})
