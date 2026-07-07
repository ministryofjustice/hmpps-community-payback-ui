import { AppointmentDto } from '../../@types/shared'
import paths from '../../paths'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'
import CheckAppointmentDetailsPage from './checkAppointmentDetailsPage'
import * as Utils from '../../utils/utils'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import LocationUtils from '../../utils/locationUtils'
import AppointmentUtils from '../../utils/appointmentUtils'
import attendanceDataFactory from '../../testutils/factories/attendanceDataFactory'
import enforcementDataFactory from '../../testutils/factories/enforcementDataFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import HtmlUtils from '../../utils/htmlUtils'
import { AppointmentOutcomeForm } from '../../@types/user-defined'

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

    beforeEach(() => {
      page = new CheckAppointmentDetailsPage()
      appointment = appointmentFactory.build({ sensitive: false })
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
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

      const result = page.viewData({
        appointment,
        project: projectDto,
        form: appointmentOutcomeFormFactory.build(),
      })

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
        form: appointmentOutcomeFormFactory.build(),
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

    describe('appointmentItems', () => {
      it('should return appointment items with formatted notes and sensitive values', () => {
        jest.spyOn(AppointmentUtils, 'formatNotesAsHtml').mockReturnValue(appointment.notes)

        const result = page.viewData({
          appointment,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.appointmentItems).toEqual([
          { key: { text: 'Notes detail' }, value: { html: appointment.notes } },
          { key: { text: 'Sensitive' }, value: { text: 'No' } },
        ])
        expect(AppointmentUtils.formatNotesAsHtml).toHaveBeenCalledWith(appointment.notes)
      })
    })

    it('should include contact outcome name in view data when contact outcome provided', () => {
      const statusColour = 'teal'
      jest.spyOn(AppointmentUtils, 'getStatusColour').mockReturnValue(statusColour)
      const className = 'govuk-tag--teal'
      jest.spyOn(HtmlUtils, 'getStatusTagClass').mockReturnValue(className)

      const contactOutcome = contactOutcomeFactory.build()

      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        contactOutcome,
        form: appointmentOutcomeFormFactory.build(),
      })

      expect(result.contactOutcome).toEqual({
        name: contactOutcome.name,
        tagClass: className,
      })
      expect(AppointmentUtils.getStatusColour).toHaveBeenCalledWith(contactOutcome)
      expect(HtmlUtils.getStatusTagClass).toHaveBeenCalledWith(statusColour)
    })

    it('should return an object containing the next path', () => {
      const nextPath = '/appointments/choose-supervisor'
      jest.spyOn(paths.appointments, 'update').mockReturnValue(nextPath)

      const result = page.viewData({
        appointment,
        project: projectFactory.build(),
        form: appointmentOutcomeFormFactory.build(),
      })

      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'choose-supervisor',
      })
      expect(result.nextPath).toBe(pathWithQuery)
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
          form: appointmentOutcomeFormFactory.build(),
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
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.complianceItems).toEqual([])
      })
    })

    describe('timeItems', () => {
      it('should return all time items with values when all values are above 0', () => {
        const appointmentWithAllTimeValues = appointmentFactory.build({
          minutesCredited: 240,
          attendanceData: { penaltyMinutes: 60 },
        })

        jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockImplementation(minutes => {
          if (minutes === 240) return '4 hours'
          if (minutes === 60) return '1 hour'
          if (minutes === 300) return '5 hours'
          return ''
        })

        const result = page.viewData({
          appointment: appointmentWithAllTimeValues,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.timeItems).toEqual([
          { key: { text: 'Hours worked' }, value: { text: '5 hours' } },
          { key: { text: 'Penalty hours' }, value: { text: '1 hour' } },
          { key: { text: 'Hours credited' }, value: { text: '4 hours' } },
        ])
      })

      it('should only show hours credited when penaltyMinutes is 0', () => {
        const appointmentWithOnlyCredited = appointmentFactory.build({
          minutesCredited: 240,
          attendanceData: { penaltyMinutes: 0 },
        })

        jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockImplementation(minutes => {
          if (minutes === 240) return '4 hours'
          return ''
        })

        const result = page.viewData({
          appointment: appointmentWithOnlyCredited,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.timeItems).toEqual([
          { key: { text: 'Hours worked' }, value: { text: '4 hours' } },
          { key: { text: 'Hours credited' }, value: { text: '4 hours' } },
        ])
      })

      it('should only show hours worked and penalty hours when minutesCredited is 0', () => {
        const appointmentWithOnlyPenalty = appointmentFactory.build({
          minutesCredited: 0,
          attendanceData: { penaltyMinutes: 120 },
        })

        jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockImplementation(minutes => {
          if (minutes === 120) return '2 hours'
          return ''
        })

        const result = page.viewData({
          appointment: appointmentWithOnlyPenalty,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.timeItems).toEqual([
          { key: { text: 'Hours worked' }, value: { text: '2 hours' } },
          { key: { text: 'Penalty hours' }, value: { text: '2 hours' } },
        ])
      })

      it('should return empty values for all time items when both minutesCredited and penaltyMinutes are 0', () => {
        const appointmentWithNoTime = appointmentFactory.build({
          minutesCredited: 0,
          attendanceData: { penaltyMinutes: 0 },
        })

        const result = page.viewData({
          appointment: appointmentWithNoTime,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.timeItems).toEqual([])
      })

      it('should default penaltyMinutes to 0 when attendanceData is undefined', () => {
        const appointmentWithoutAttendance = appointmentFactory.build({
          minutesCredited: 180,
          attendanceData: undefined,
        })

        jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockImplementation(minutes => {
          if (minutes === 180) return '3 hours'
          return ''
        })

        const result = page.viewData({
          appointment: appointmentWithoutAttendance,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.timeItems).toEqual([
          { key: { text: 'Hours worked' }, value: { text: '3 hours' } },
          { key: { text: 'Hours credited' }, value: { text: '3 hours' } },
        ])
      })
    })

    describe('sharedItems', () => {
      it('should return all shared items with values when all properties are defined', () => {
        const enforcementData = enforcementDataFactory.build()
        const appointmentWithEnforcement = appointmentFactory.build({
          enforcementData,
          alertActive: true,
        })

        jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue('15 February 2025')
        jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Yes')

        const result = page.viewData({
          appointment: appointmentWithEnforcement,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.sharedItems).toEqual([
          { key: { text: 'Enforcement action' }, value: { text: enforcementData.enforcementActionName } },
          { key: { text: 'Respond by' }, value: { text: '15 February 2025' } },
          { key: { text: 'Alert sent' }, value: { text: 'Yes' } },
        ])
      })

      it('should omit enforcement action when enforcementData is undefined', () => {
        const appointmentWithoutEnforcement = appointmentFactory.build({
          enforcementData: undefined,
          alertActive: true,
        })

        jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Yes')

        const result = page.viewData({
          appointment: appointmentWithoutEnforcement,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.sharedItems).toEqual([{ key: { text: 'Alert sent' }, value: { text: 'Yes' } }])
      })

      it('should omit respond by when respondBy is undefined but enforcementActionName is defined', () => {
        const enforcementData = enforcementDataFactory.build({
          enforcementActionName: 'Warning Letter',
          respondBy: undefined,
        })
        const appointmentWithPartialEnforcement = appointmentFactory.build({
          enforcementData,
          alertActive: false,
        })

        jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('No')

        const result = page.viewData({
          appointment: appointmentWithPartialEnforcement,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.sharedItems).toEqual([
          { key: { text: 'Enforcement action' }, value: { text: 'Warning Letter' } },
          { key: { text: 'Alert sent' }, value: { text: 'No' } },
        ])
      })

      it('should handle alertActive being undefined', () => {
        const enforcementData = enforcementDataFactory.build()
        const appointmentWithNoAlert = appointmentFactory.build({
          enforcementData,
          alertActive: undefined,
        })

        jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue('1 April 2025')

        const result = page.viewData({
          appointment: appointmentWithNoAlert,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.sharedItems).toEqual([
          { key: { text: 'Enforcement action' }, value: { text: enforcementData.enforcementActionName } },
          { key: { text: 'Respond by' }, value: { text: '1 April 2025' } },
        ])
      })
    })

    describe('showMissingOutcomeMessage', () => {
      it('should return false when an outcome is associated with the appointment', () => {
        const appointmentWithOutcome = appointmentFactory.build({ contactOutcomeCode: 'OUTC' })

        const result = page.viewData({
          appointment: appointmentWithOutcome,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.showMissingOutcomeMessage).toBe(false)
      })

      it('should return false when no outcome exists and appointment is in the future', () => {
        const appointmentWithNoOutcome = appointmentFactory.build({ contactOutcomeCode: undefined })
        jest.spyOn(DateTimeFormats, 'dateTimeIsInFuture').mockReturnValue(true)

        const result = page.viewData({
          appointment: appointmentWithNoOutcome,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(DateTimeFormats.dateTimeIsInFuture).toHaveBeenCalledWith(
          appointmentWithNoOutcome.date,
          appointmentWithNoOutcome.startTime,
        )
        expect(result.showMissingOutcomeMessage).toBe(false)
      })

      it('should return true when no outcome exists and appointment is in the past', () => {
        const appointmentWithNoOutcome = appointmentFactory.build({ contactOutcomeCode: undefined })
        jest.spyOn(DateTimeFormats, 'dateTimeIsInFuture').mockReturnValue(false)

        const result = page.viewData({
          appointment: appointmentWithNoOutcome,
          project: projectFactory.build(),
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(DateTimeFormats.dateTimeIsInFuture).toHaveBeenCalledWith(
          appointmentWithNoOutcome.date,
          appointmentWithNoOutcome.startTime,
        )
        expect(result.showMissingOutcomeMessage).toBe(true)
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
          form: appointmentOutcomeFormFactory.build(),
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
          form: appointmentOutcomeFormFactory.build(),
        })

        expect(result.showContinueButton).toBe(false)
      })
    })
  })

  describe('commonViewData', () => {
    let page: CheckAppointmentDetailsPage
    let appointment: AppointmentDto
    const updatePath = '/update'

    beforeEach(() => {
      page = new CheckAppointmentDetailsPage()
      appointment = appointmentFactory.build({ sensitive: false })
      jest.spyOn(paths.appointments, 'update').mockReturnValue(updatePath)
    })

    it('should return a back link to the session page for GROUP projects', async () => {
      const backLink = '/session/1'
      const originalSearch = { provider: 'provider' }
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const result = page.commonViewData({
        appointmentOrSession: appointment,
        project: projectFactory.build(),
        originalSearch,
        form: {} as AppointmentOutcomeForm,
        formId: 'formId',
      })
      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment, originalSearch)
      expect(result.backLink).toBe(backLink)
    })

    it('should return a back link to the project page for INDIVIDUAL projects', async () => {
      const backLink = '/project/1'
      jest.spyOn(paths.projects, 'show').mockReturnValue(backLink)
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      page = new CheckAppointmentDetailsPage()
      const search = { provider: 'provider' }

      const result = page.commonViewData({
        appointmentOrSession: appointment,
        project,
        originalSearch: search,
        form: {} as AppointmentOutcomeForm,
        formId: 'formId',
      })
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode })
      expect(Utils.pathWithQuery).toHaveBeenCalledWith(backLink, search)
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an update path for the appointment details page', async () => {
      const result = page.commonViewData({
        appointmentOrSession: appointment,
        project: projectFactory.build(),
        originalSearch: {},
        form: {} as AppointmentOutcomeForm,
        formId: 'formId',
      })
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: 'appointment-details',
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })
  })

  describe('next', () => {
    it('should return supervisor link with given appointmentId', () => {
      const appointmentId = '1'
      const projectCode = '2'
      const path = '/path'
      const page = new CheckAppointmentDetailsPage()

      jest.spyOn(paths.appointments, 'update').mockReturnValue(path)

      expect(page.next({ projectCode, appointmentId, form: {} as AppointmentOutcomeForm })).toBe(pathWithQuery)
      expect(paths.appointments.update).toHaveBeenCalledWith({
        projectCode,
        appointmentId,
        page: 'choose-supervisor',
      })
    })
  })
})
