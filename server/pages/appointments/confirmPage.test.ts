import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ConfirmPage from './confirmPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'

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

    describe('submittedItems', () => {
      it('should return an object containing summary list items', async () => {
        const submitted = appointmentOutcomeFormFactory.build({ enforcement: undefined })
        const result = page.viewData(appointment, submitted)
        expect(result.submittedItems).toEqual([
          {
            key: {
              text: 'Supervising officer',
            },
            value: {
              text: submitted.supervisorOfficerCode,
            },
          },
          {
            key: {
              text: 'Attendance',
            },
            value: {
              text: submitted.contactOutcome.name,
            },
          },
          {
            key: {
              text: 'Start and end time',
            },
            value: {
              html: '09:00 - 17:00<br>Total hours worked: 8 hours',
            },
          },
          {
            key: {
              text: 'Penalty hours',
            },
            value: {
              html: '1 hour<br>Total hours credited: 7 hours',
            },
          },
          {
            key: {
              text: 'Compliance',
            },
            value: {
              html: submitted.attendanceData.hiVisWorn.toString(),
            },
          },
        ])
      })

      describe('when there is no penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const formWithoutPenaltyHours = appointmentOutcomeFormFactory.build({ attendanceData: { penaltyTime: null } })
          const result = page.viewData(appointment, formWithoutPenaltyHours)

          expect(result.submittedItems).toContainEqual({
            key: { text: 'Penalty hours' },
            value: { html: 'No penalty time applied<br>Total hours credited: 8 hours' },
          })
        })
      })

      describe('when there is 00:00 penalty time applied', () => {
        it('should return string containing full hours worked', () => {
          const formWithZeroPenaltyHours = appointmentOutcomeFormFactory.build({
            attendanceData: { penaltyTime: '00:00' },
          })
          const result = page.viewData(appointment, formWithZeroPenaltyHours)

          expect(result.submittedItems).toContainEqual({
            key: { text: 'Penalty hours' },
            value: { html: 'No penalty time applied<br>Total hours credited: 8 hours' },
          })
        })
      })

      it('should contain enforcement item if enforcement has value', async () => {
        const formWithEnforcement = appointmentOutcomeFormFactory.build({ enforcement: { name: 'Some enforcement' } })
        const result = page.viewData(appointment, formWithEnforcement)
        expect(result.submittedItems).toContainEqual({
          key: {
            text: 'Enforcement',
          },
          value: {
            text: 'Some enforcement',
          },
        })
      })
    })
  })
})
