import { AppointmentDto } from '../../@types/shared'
import Offender from '../../models/offender'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import CheckAppointmentDetailsPage from './checkAppointmentDetailsPage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import LocationUtils from '../../utils/locationUtils'
import AppointmentUtils from '../../utils/appointmentUtils'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'

jest.mock('../../models/offender')

describe('CheckAppointmentDetailsPage', () => {
  const pathWithQuery = '/path?'
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Utils, 'pathWithQuery').mockReturnValue(pathWithQuery)
  })

  describe('viewData', () => {
    let page: CheckAppointmentDetailsPage
    let appointment: AppointmentDto
    const updatePath = '/update'
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      page = new CheckAppointmentDetailsPage({}, projectFactory.build())
      appointment = appointmentFactory.build()
      jest.spyOn(paths.appointments, 'appointmentDetails').mockReturnValue(updatePath)
    })

    it('should return an object containing project details', () => {
      const projectDto = projectFactory.build()
      const date = '1 January 2025'
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      const pickUpTime = '09:00'
      const startTime = '09:00'
      const endTime = '17:00'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)

      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)
      jest.spyOn(DateTimeFormats, 'stripTime').mockImplementation(timeVal => {
        if (timeVal === appointment.endTime) {
          return endTime
        }
        if (timeVal === appointment.startTime) {
          return startTime
        }
        return pickUpTime
      })

      const result = page.viewData({ appointment, project: projectDto, originalSearch: {} })

      expect(result.projectItems).toEqual([
        { key: { text: 'Region' }, value: { text: projectDto.providerName } },
        { key: { text: 'Team' }, value: { text: projectDto.teamName } },
        { key: { text: 'Project' }, value: { text: projectDto.projectName } },
        { key: { text: 'Project type' }, value: { text: projectDto.projectType.name } },
        { key: { text: 'Location' }, value: { text: location } },
        { key: { text: 'Date' }, value: { text: date } },
        { key: { text: 'Time' }, value: { text: `${startTime} - ${endTime}` } },
        { key: { text: 'Pick up place' }, value: { text: location } },
        { key: { text: 'Pick up time' }, value: { text: pickUpTime } },
        { key: { text: 'Supervising team' }, value: { text: appointment.supervisingTeam } },
        { key: { text: 'Supervising officer' }, value: { text: appointment.supervisorOfficerName } },
      ])
    })

    it('should exclude pick up place and time if they are undefined', () => {
      const projectDto = projectFactory.build()
      const date = '1 January 2025'
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      const startTime = '09:00'
      const endTime = '17:00'
      const appointmentWithoutPickUp = appointmentFactory.build({ pickUpData: undefined })

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)
      jest.spyOn(LocationUtils, 'locationToString').mockImplementation(val => (val ? location : undefined))
      jest.spyOn(DateTimeFormats, 'stripTime').mockImplementation(timeVal => {
        if (timeVal === appointmentWithoutPickUp.endTime) {
          return endTime
        }
        if (timeVal === appointmentWithoutPickUp.startTime) {
          return startTime
        }
        return ''
      })

      const result = page.viewData({
        appointment: appointmentWithoutPickUp,
        project: projectDto,
        originalSearch: {},
      })

      expect(result.projectItems).toEqual([
        { key: { text: 'Region' }, value: { text: projectDto.providerName } },
        { key: { text: 'Team' }, value: { text: projectDto.teamName } },
        { key: { text: 'Project' }, value: { text: projectDto.projectName } },
        { key: { text: 'Project type' }, value: { text: projectDto.projectType.name } },
        { key: { text: 'Location' }, value: { text: location } },
        { key: { text: 'Date' }, value: { text: date } },
        { key: { text: 'Time' }, value: { text: `${startTime} - ${endTime}` } },
        { key: { text: 'Supervising team' }, value: { text: appointmentWithoutPickUp.supervisingTeam } },
        { key: { text: 'Supervising officer' }, value: { text: appointmentWithoutPickUp.supervisorOfficerName } },
      ])
    })

    it('should return an object containing appointment details', () => {
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)
      jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Yes')

      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        originalSearch: {},
      })

      const appointmentDetails = {
        notes: appointment.notes,
        sensitive: 'Yes',
      }

      expect(result.appointment).toEqual(appointmentDetails)
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

      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        originalSearch: {},
      })

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/session/1'
      const originalSearch = { provider: 'provider' }
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        originalSearch,
      })
      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment, originalSearch)
      expect(result.backLink).toBe(backLink)
    })

    it('should return an object containing a back link to the project page if appointment type is INDIVIDUAL', async () => {
      const backLink = '/project/1'
      jest.spyOn(paths.projects, 'show').mockReturnValue(backLink)
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      page = new CheckAppointmentDetailsPage({}, project)
      const search = { provider: 'provider' }
      const result = page.viewData({ appointment, project, originalSearch: search })
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode })
      expect(Utils.pathWithQuery).toHaveBeenCalledWith(backLink, search)
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        originalSearch: {},
      })
      expect(paths.appointments.appointmentDetails).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('complianceItems', () => {
      it('should return compliance items when attendance data is defined', () => {
        const attendanceData = attendanceDataFactory.build({
          hiVisWorn: true,
          workedIntensively: false,
          workQuality: 'GOOD',
          behaviour: 'EXCELLENT',
        })
        const appointmentWithAttendance = appointmentFactory.build({ attendanceData })

        jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Yes')
        jest.spyOn(AppointmentUtils, 'formatComplianceRatings').mockImplementation(rating => {
          const ratingMap: { [key: string]: string } = {
            GOOD: 'Good',
            EXCELLENT: 'Excellent',
          }
          return ratingMap[rating]
        })

        const result = page.viewData({
          appointment: appointmentWithAttendance,
          project: projectFactory.build(),
          originalSearch: {},
        })

        expect(result.complianceItems).toEqual([
          { key: { text: 'Wore hi-vis' }, value: { text: 'Yes' } },
          { key: { text: 'Working intensively' }, value: { text: 'Yes' } },
          { key: { text: 'Work quality' }, value: { text: 'Good' } },
          { key: { text: 'Behaviour' }, value: { text: 'Excellent' } },
        ])
      })

      it('should return empty array when attendance data is undefined', () => {
        const appointmentWithoutAttendance = appointmentFactory.build({ attendanceData: undefined })

        const result = page.viewData({
          appointment: appointmentWithoutAttendance,
          project: projectFactory.build(),
          originalSearch: {},
        })

        expect(result.complianceItems).toEqual([])
      })
    })

    describe('showContinueButton', () => {
      it('should return true if no outcome is associated with the appointment', () => {
        const appointmentWithNoOutcome = appointmentFactory.build({ contactOutcomeCode: undefined })
        const projectDto = projectFactory.build()
        const dateAndTime = '1 January 2025, 09:00 - 17:00'
        const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
        jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
        jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

        const result = page.viewData({
          appointment: appointmentWithNoOutcome,
          project: projectDto,
          originalSearch: {},
        })

        expect(result.showContinueButton).toBe(true)
      })

      it('should return false if an outcome is associated with the appointment', () => {
        const appointmentWithOutcome = appointmentFactory.build({ contactOutcomeCode: 'OUTC' })
        const projectDto = projectFactory.build()
        const dateAndTime = '1 January 2025, 09:00 - 17:00'
        const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
        jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
        jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

        const result = page.viewData({
          appointment: appointmentWithOutcome,
          project: projectDto,
          originalSearch: {},
        })

        expect(result.showContinueButton).toBe(false)
      })
    })
  })

  describe('next', () => {
    it('should return attendance outcome link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const path = '/path'
      const page = new CheckAppointmentDetailsPage({}, projectFactory.build())

      jest.spyOn(paths.appointments, 'chooseSupervisor').mockReturnValue(path)

      expect(page.next(projectCode, appointmentId)).toBe(pathWithQuery)
      expect(paths.appointments.chooseSupervisor).toHaveBeenCalledWith({ projectCode, appointmentId })
    })
  })

  describe('form', () => {
    it('returns data from query given object with existing data', () => {
      const form = appointmentOutcomeFormFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)
      const [selectedSupervisor] = supervisors
      const page = new CheckAppointmentDetailsPage({ supervisor: selectedSupervisor.code }, projectFactory.build())

      const result = page.updateForm(form, supervisors)
      expect(result).toEqual({ ...form, supervisor: selectedSupervisor })
    })
  })

  describe('setFormId', () => {
    it('should update the formId', () => {
      const page = new CheckAppointmentDetailsPage({}, projectFactory.build())
      page.setFormId('1')

      expect(page.formId).toEqual('1')
    })
  })
})
