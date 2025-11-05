import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import CheckProjectDetailsPage from './checkProjectDetailsPage'
import * as Utils from '../../utils/utils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

jest.mock('../../models/offender')

describe('CheckProjectDetailsPage', () => {
  const pathWithQuery = '/path?'
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let page: CheckProjectDetailsPage
    let appointment: AppointmentDto
    let supervisors: SupervisorSummaryDto[]
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new CheckProjectDetailsPage({})
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
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, supervisors)
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({ appointmentId: appointment.id.toString() })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return an object containing supervisorItems', async () => {
      const appointmentWithNoAttendanceData = appointmentFactory.build({ supervisorOfficerCode: undefined })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointmentWithNoAttendanceData, supervisors)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
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
        'fullName',
        'code',
        'Choose supervisor',
        appointment.supervisorOfficerCode,
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

  describe('next', () => {
    it('should return attendance outcome link with given appointmentId', () => {
      const appointmentId = '1'
      const path = '/path'
      const page = new CheckProjectDetailsPage({})

      jest.spyOn(paths.appointments, 'attendanceOutcome').mockReturnValue(path)

      expect(page.next(appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given empty object', () => {
      const form = {}
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors
      const page = new CheckProjectDetailsPage({ supervisor: selectedSupervisor.code })

      const result = page.updateForm(form, supervisors)
      expect(result).toEqual({ supervisor: selectedSupervisor })
    })

    it('returns data from query given object with existing data', () => {
      const form = { startTime: '10:00', attendanceData: { penaltyTime: '01:00' } } as AppointmentOutcomeForm
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors
      const page = new CheckProjectDetailsPage({ supervisor: selectedSupervisor.code })

      const result = page.updateForm(form, supervisors)
      expect(result).toEqual({
        startTime: '10:00',
        attendanceData: { penaltyTime: '01:00' },
        supervisor: selectedSupervisor,
      })
    })
  })

  describe('setFormId', () => {
    it('should update the formId', () => {
      const page = new CheckProjectDetailsPage({})
      page.setFormId('1')

      expect(page.formId).toEqual('1')
    })
  })
})
