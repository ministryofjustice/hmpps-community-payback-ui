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
import locationFactory from '../../testutils/factories/locationFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'

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
    const providerDto = providerSummaryFactory.build()

    beforeEach(() => {
      page = new CheckAppointmentDetailsPage({}, projectFactory.build())
      appointment = appointmentFactory.build()
      jest.spyOn(paths.appointments, 'appointmentDetails').mockReturnValue(updatePath)
    })

    it('should return an object containing project details', () => {
      const projectDto = projectFactory.build()
      const dateAndTime = '1 January 2025, 09:00 - 17:00'
      const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

      const result = page.viewData(appointment, projectDto, providerDto, {})

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
      jest.spyOn(Utils, 'yesNoDisplayValue').mockReturnValue('Yes')

      const result = page.viewData(appointmentDto, projectFactory.build(), providerDto, {})

      const appointmentDetails = {
        pickUpPlace: location,
        pickUpTime: time,
        providerCode: appointmentDto.providerCode,
        notes: appointmentDto.notes,
        sensitive: 'Yes',
        provider: providerDto.name,
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

      const result = page.viewData(appointment, projectFactory.build(), providerDto, {})

      expect(result.offender).toBe(offender)
    })

    it('should return an object containing a back link to the session page', async () => {
      const backLink = '/session/1'
      const search = { provider: 'provider' }
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const result = page.viewData(appointment, projectFactory.build(), providerDto, search)
      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment, search)
      expect(result.backLink).toBe(backLink)
    })

    it('should return an object containing a back link to the project page if appointment type is INDIVIDUAL', async () => {
      const backLink = '/project/1'
      jest.spyOn(paths.projects, 'show').mockReturnValue(backLink)
      const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
      page = new CheckAppointmentDetailsPage({}, project)
      const search = { provider: 'provider' }
      const result = page.viewData(appointment, project, providerDto, search)
      expect(paths.projects.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode })
      expect(Utils.pathWithQuery).toHaveBeenCalledWith(backLink, search)
      expect(result.backLink).toBe(pathWithQuery)
    })

    it('should return an object containing an update link for the form', async () => {
      const result = page.viewData(appointment, projectFactory.build(), providerDto, {})
      expect(paths.appointments.appointmentDetails).toHaveBeenCalledWith({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      })
      expect(result.updatePath).toBe(pathWithQuery)
    })

    describe('showContinueButton', () => {
      it('should return true if no outcome is associated with the appointment', () => {
        const appointmentWithNoOutcome = appointmentFactory.build({ contactOutcomeCode: undefined })
        const projectDto = projectFactory.build()
        const dateAndTime = '1 January 2025, 09:00 - 17:00'
        const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
        jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
        jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

        const result = page.viewData(appointmentWithNoOutcome, projectDto, providerDto, {})

        expect(result.showContinueButton).toBe(true)
      })

      it('should return false if an outcome is associated with the appointment', () => {
        const appointmentWithOutcome = appointmentFactory.build({ contactOutcomeCode: 'OUTC' })
        const projectDto = projectFactory.build()
        const dateAndTime = '1 January 2025, 09:00 - 17:00'
        const location = '1001, 14B Office Street, City, Shireshire, ZY98XW'
        jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)
        jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(location)

        const result = page.viewData(appointmentWithOutcome, projectDto, providerDto, {})

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
