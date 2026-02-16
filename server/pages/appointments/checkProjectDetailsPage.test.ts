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
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import projectFactory from '../../testutils/factories/projectFactory'
import LocationUtils from '../../utils/locationUtils'
import locationFactory from '../../testutils/factories/locationFactory'

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
    let form: AppointmentOutcomeForm
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new CheckProjectDetailsPage({}, projectFactory.build())
      appointment = appointmentFactory.build()
      supervisors = supervisorSummaryFactory.buildList(2)
      form = appointmentOutcomeFormFactory.build()
      jest.spyOn(paths.appointments, 'projectDetails').mockReturnValue(updatePath)
    })

    it('should return an object containing project details', () => {
      const projectDto = projectFactory.build()
      const dateAndTime = '1 January 2025, 09:00 - 17:00'
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

      const result = page.viewData(appointment, supervisors, form, projectDto)

      const project = {
        name: projectDto.projectName,
        type: projectDto.projectType.name,
        supervisingTeam: appointment.supervisingTeam,
        location,
        dateAndTime,
      }

      expect(result.project).toStrictEqual(project)
    })

    it('should return an object containing appointment details', () => {
      const time = '09:00'
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      const appointmentDto = appointmentFactory.build({ pickUpData: { time, location: locationFactory.build() } })
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)
      jest.spyOn(DateTimeFormats, 'stripTime').mockReturnValue(time)

      const result = page.viewData(appointmentDto, supervisors, form, projectFactory.build())

      const appointmentDetails = {
        pickUpPlace: location,
        pickUpTime: time,
        providerCode: appointmentDto.providerCode,
        notes: appointmentDto.notes,
      }

      expect(result.appointment).toStrictEqual(appointmentDetails)
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

      const result = page.viewData(appointment, supervisors, form, projectFactory.build())

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/session/1'
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const result = page.viewData(appointment, supervisors, form, projectFactory.build())
      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment)
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing a back link to the project page if appointment type is INDIVIDUAL', async () => {
      const backLink = '/project/1'
      jest.spyOn(paths.projects, 'show').mockReturnValue(backLink)
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      page = new CheckProjectDetailsPage({}, project)
      const result = page.viewData(appointment, supervisors, form, project)
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode })
      expect(Utils.pathWithQuery).toHaveBeenCalledWith(backLink, { form: page.formId })
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, supervisors, form, projectFactory.build())
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    it('should return an object containing supervisorItems', async () => {
      form = appointmentOutcomeFormFactory.build({ supervisor: supervisorSummaryFactory.build({ code: undefined }) })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointment, supervisors, form, projectFactory.build())

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
      const code = 'supervisor'
      form = appointmentOutcomeFormFactory.build({ supervisor: { code } })
      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const result = page.viewData(appointment, supervisors, form, projectFactory.build())

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        code,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })

    it('should pass the query value to the select input options if the page has errors', () => {
      const supervisor = ''
      const supervisorItems = [
        { text: 'Gwen', value: '' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      page = new CheckProjectDetailsPage({ supervisor }, projectFactory.build())
      page.validate()

      const result = page.viewData(
        appointment,
        supervisors,
        appointmentOutcomeFormFactory.build(),
        projectFactory.build(),
      )

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        supervisors,
        'fullName',
        'code',
        'Choose supervisor',
        supervisor,
      )

      expect(result.supervisorItems).toBe(supervisorItems)
    })
  })

  describe('validate', () => {
    it('has no errors if supervisor has value', () => {
      const query = { supervisor: 'Jane' }
      const page = new CheckProjectDetailsPage(query, projectFactory.build())
      page.validate()

      expect(page.hasErrors).toBe(false)
      expect(page.validationErrors).toStrictEqual({})
    })

    it.each(['', undefined])('has errors if supervisor is empty', (supervisor: string | undefined) => {
      const query = { supervisor }
      const page = new CheckProjectDetailsPage(query, projectFactory.build())
      page.validate()

      expect(page.hasErrors).toBe(true)
      expect(page.validationErrors).toStrictEqual({ supervisor: { text: 'Select a supervisor' } })
    })
  })

  describe('next', () => {
    it('should return attendance outcome link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const path = '/path'
      const page = new CheckProjectDetailsPage({}, projectFactory.build())

      jest.spyOn(paths.appointments, 'attendanceOutcome').mockReturnValue(path)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors
      const page = new CheckProjectDetailsPage({ supervisor: selectedSupervisor.code }, projectFactory.build())

      const result = page.updateForm(form, supervisors)
      expect(result).toEqual({ ...form, supervisor: selectedSupervisor })
    })
  })

  describe('setFormId', () => {
    it('should update the formId', () => {
      const page = new CheckProjectDetailsPage({}, projectFactory.build())
      page.setFormId('1')

      expect(page.formId).toEqual('1')
    })
  })
})
