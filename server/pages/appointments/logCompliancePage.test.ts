import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogCompliancePage from './logCompliancePage'

jest.mock('../../models/offender')

describe('LogCompliancePage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: LogCompliancePage
    let appointment: AppointmentDto
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new LogCompliancePage()
      appointment = appointmentFactory.build()
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

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/appointment/1'
      jest.spyOn(paths.appointments, 'logHours').mockReturnValue(backLink)

      const result = page.viewData(appointment)
      expect(result.backLink).toBe(backLink)
    })

    it('should return an object containing an update link for the form', async () => {
      const updatePath = '/update'
      jest.spyOn(paths.appointments, 'logCompliance').mockReturnValue(updatePath)

      const result = page.viewData(appointment)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(updatePath)
    })
  })
})
