import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import CheckProjectDetailsPage from './checkProjectDetailsPage'

jest.mock('../../models/offender')

describe('CheckProjectDetailsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    let page: CheckProjectDetailsPage
    let appointment: AppointmentDto
    let supervisors: SupervisorSummaryDto[]
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new CheckProjectDetailsPage()
      appointment = appointmentFactory.build()
      supervisors = supervisorSummaryFactory.buildList(2)
      jest.spyOn(paths.appointments, 'projectDetails').mockReturnValue(updatePath)
    })

    it('should return an object containing project details', () => {
      const dateAndTime = '1 January 2025, 09:00 - 17:00'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)

      const result = page.viewData(appointment, supervisors)

      const project = {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
        dateAndTime,
      }

      expect(result.project).toStrictEqual(project)
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

      const result = page.viewData(appointment, supervisors)

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/session/1'
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const result = page.viewData(appointment, supervisors)
      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment)
      expect(result.backLink).toBe(backLink)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, supervisors)
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(updatePath)
    })

    it('should return an object containing supervisorItems', async () => {
      const appointmentWithNoAttendanceData = appointmentFactory.build({ attendanceData: undefined })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointmentWithNoAttendanceData, supervisors)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'name',
        'code',
        'Choose supervisor',
        undefined,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })

    it('should pass the supervisor to the select input options formatter if any value', async () => {
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointment, supervisors)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'name',
        'code',
        'Choose supervisor',
        appointment.attendanceData.supervisorOfficerCode,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })
  })

  describe('validate', () => {
    it('has no errors if supervisor has value', () => {
      const query = { supervisor: 'Jane' }
      const page = new CheckProjectDetailsPage(query)
      page.validate()

      expect(page.hasErrors).toBe(false)
      expect(page.validationErrors).toStrictEqual({})
    })

    it.each(['', undefined])('has errors if supervisor is empty', (supervisor: string | undefined) => {
      const query = { supervisor }
      const page = new CheckProjectDetailsPage(query)
      page.validate()

      expect(page.hasErrors).toBe(true)
      expect(page.validationErrors).toStrictEqual({ supervisor: { text: 'Select a supervisor' } })
    })
  })
})
