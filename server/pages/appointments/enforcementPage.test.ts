import { AppointmentDto, EnforcementActionDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import EnforcementPage from './enforcementPage'
import * as Utils from '../../utils/utils'
import enforcementDataFactory from '../../testutils/factories/enforcementDataFactory'
import enforcementActionFactory from '../../testutils/factories/enforcementActionFactory'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

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
  })

  describe('validationErrors', () => {
    it('has no errors if supervisor has value', () => {
      const query = { enforcement: '1' }
      const page = new EnforcementPage(query)
      page.validate()

      expect(page.hasErrors).toBe(false)
      expect(page.validationErrors).toStrictEqual({})
    })

    it.each(['', undefined])('has errors if supervisor is empty', (enforcement: string | undefined) => {
      const query = { enforcement }
      const page = new EnforcementPage(query)
      page.validate()

      expect(page.hasErrors).toBe(true)
      expect(page.validationErrors).toEqual({ enforcement: { text: 'Select an enforcement action' } })
    })
  })
})
