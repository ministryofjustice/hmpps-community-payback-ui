import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ConfirmPage from './confirmPage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

jest.mock('../../models/offender')

describe('ConfirmPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: ConfirmPage
    let appointment: AppointmentDto
    let form: AppointmentOutcomeForm

    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const pathWithQuery = '/path?'

    beforeEach(() => {
      page = new ConfirmPage({})
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

    it('should return an object containing start and end time', () => {
      const result = page.viewData(appointment, form)

      expect(result.startTimeEndTime).toBe('09:00 - 17:00<br>Total hours worked: 8 hours')
    })

    it('should return an object containing a back link to the session page', async () => {
      jest.spyOn(paths.appointments, 'logCompliance')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      jest.spyOn(paths.appointments, 'confirm')

      const result = page.viewData(appointment, form)
      expect(paths.appointments.logCompliance).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('penaltyTime', () => {
      describe('when there is no penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const formWithoutPenaltyHours = appointmentOutcomeFormFactory.build({ attendanceData: { penaltyTime: null } })
          const result = page.viewData(appointment, formWithoutPenaltyHours)

          expect(result.penaltyTime).toBe('No penalty time applied<br>Total hours credited: 8 hours')
        })
      })

      describe('when there is 00:00 penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const formWithZeroPenaltyHours = appointmentOutcomeFormFactory.build({
            attendanceData: { penaltyTime: '00:00' },
          })
          const result = page.viewData(appointment, formWithZeroPenaltyHours)

          expect(result.penaltyTime).toBe('No penalty time applied<br>Total hours credited: 8 hours')
        })
      })

      describe('when there is penalty time applied', () => {
        it('should return string containing full hours worked - penalty time', () => {
          const formWithPenaltyHours = appointmentOutcomeFormFactory.build({ attendanceData: { penaltyTime: '01:00' } })
          const result = page.viewData(appointment, formWithPenaltyHours)

          expect(result.penaltyTime).toBe('1 hour<br>Total hours credited: 7 hours')
        })
      })
    })
  })
})
