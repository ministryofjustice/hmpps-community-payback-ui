import { AppointmentDto, EnforcementActionDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import EnforcementPage from './enforcementPage'
import * as Utils from '../../utils/utils'
import enforcementDataFactory from '../../testutils/factories/enforcementDataFactory'
import enforcementActionFactory from '../../testutils/factories/enforcementActionFactory'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import GovukFrontendDateInput from '../../forms/GovukFrontendDateInput'
import DateTimeFormats from '../../utils/dateTimeUtils'

jest.mock('../../models/offender')

describe('EnforcementPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: EnforcementPage
    let appointment: AppointmentDto
    let enforcementActions: EnforcementActionDto[]
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const pathWithQuery = '/path?'

    beforeEach(() => {
      page = new EnforcementPage({})
      appointment = appointmentFactory.build()
      enforcementActions = enforcementActionFactory.buildList(2)
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

      const result = page.viewData(appointment, enforcementActions)

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link ', async () => {
      jest.spyOn(paths.appointments, 'logCompliance')

      const result = page.viewData(appointment, enforcementActions)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'confirm')

      const result = page.viewData(appointment, enforcementActions)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return an object containing enforcement action items', async () => {
      const enforcementItems = [
        { text: 'Attended', value: '1 ' },
        { text: 'Unacceptable absence', value: '2' },
      ]

      const selected = '1'
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(enforcementItems)
      const appointmentWithEnforcement = appointmentFactory.build({
        enforcementData: enforcementDataFactory.build({ enforcementActionId: selected }),
      })

      const result = page.viewData(appointmentWithEnforcement, enforcementActions)
      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        enforcementActions,
        'name',
        'id',
        'Choose enforcement action',
        selected,
      )
      expect(result.enforcementItems).toEqual(enforcementItems)
    })

    it('should return an object containing date items', () => {
      const dateItems = [
        { name: 'day', classes: '', value: '07' },
        { name: 'month', classes: '', value: '08' },
      ]

      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)

      const result = page.viewData(appointment, enforcementActions)
      expect(result.dateItems).toEqual(dateItems)
    })

    it('should set the respond by date to 7 days from now', () => {
      const date = { day: '09', month: '10', year: '2025', formattedDate: '2025-01-01' }
      jest.spyOn(DateTimeFormats, 'getTodaysDatePlusDays').mockReturnValue(date)
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate')

      page.viewData(appointment, enforcementActions)
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

    describe('enforcement', () => {
      it.each(['', undefined])('has errors if enforcement is empty', (enforcement: string | undefined) => {
        const query = {
          enforcement,
          'respondBy-day': '07',
          'respondBy-month': '08',
          'respondBy-year': '2025',
        }

        const page = new EnforcementPage(query)
        page.validate()

        expect(page.hasErrors).toBe(true)
        expect(page.validationErrors).toEqual({ enforcement: { text: 'Select an enforcement action' } })
      })
    })

    describe('respondBy Date', () => {
      it('returns errors when date is empty', () => {
        const page = new EnforcementPage({ enforcement: 'x' })
        page.validate()

        expect(page.hasErrors).toBe(true)
        expect(page.validationErrors).toEqual({
          'respondBy-day': { text: 'The date to respond by must include a day, month and year' },
        })
      })

      it('returns errors when date is invalid', () => {
        const page = new EnforcementPage({
          enforcement: 'x',
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
    it('returns data from query given empty object', () => {
      const form = { key: { id: '1', type: 'type' }, data: {} }
      const enforcementActions = enforcementActionFactory.buildList(2)
      const page = new EnforcementPage({ enforcement: enforcementActions[0].id })

      const result = page.form(form, enforcementActions)
      expect(result).toEqual({ enforcement: { action: enforcementActions[0], respondBy: undefined } })
    })

    it('returns data from query given object with existing data', () => {
      const form = {
        key: { id: '1', type: 'type' },
        data: { startTime: '10:00', attendanceData: { penaltyTime: '01:00' } },
      }
      const enforcementActions = enforcementActionFactory.buildList(2)
      const page = new EnforcementPage({ enforcement: enforcementActions[0].id })

      const result = page.form(form, enforcementActions)
      expect(result).toEqual({
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        enforcement: { action: enforcementActions[0], respondBy: undefined },
      })
    })

    it('includes respond by date in form data if value', () => {
      const form = { key: { id: '1', type: 'type' }, data: {} }
      const page = new EnforcementPage({
        'respondBy-day': '07',
        'respondBy-month': '08',
        'respondBy-year': '2025',
      })

      const enforcementActions = enforcementActionFactory.buildList(2)

      const result = page.form(form, enforcementActions)
      expect(result).toEqual({ enforcement: { action: undefined, respondBy: '2025-08-07' } })
    })
  })
})
