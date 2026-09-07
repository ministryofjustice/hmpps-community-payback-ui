import Offender from '../models/offender'
import paths from '../paths'
import appointmentSummaryFactory from '../testutils/factories/appointmentSummaryFactory'
import beneficiaryDetailsFactory from '../testutils/factories/beneficiaryDetailsFactory'
import projectFactory from '../testutils/factories/projectFactory'
import AppointmentUtils from '../utils/appointmentUtils'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import SessionUtils from '../utils/sessionUtils'
import { pathWithQuery } from '../utils/utils'
import ProjectPage from './projectPage'

jest.mock('../models/offender')

describe('ProjectPage', () => {
  describe('appointmentListTableRows', () => {
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const offenderHtml = '<strong>Sam Smith</strong>'
    const mockOffender = {
      name: 'Sam Smith',
      crn: 'CRN123',
      isLimited: false,
      getTableHtml: () => offenderHtml,
    }

    beforeEach(() => {
      offenderMock.mockImplementation(() => {
        return mockOffender
      })
      jest.restoreAllMocks()
    })

    it('returns appointment list formatted into table rows', () => {
      const mockDates = ['12 January 2026', '13 January 2025']
      const mockTimes = ['09:00 - 12:00', '10:00 - 13:00']
      const mockStatusTags = ['<span>Attended</span>', '<span>Missed</span>']

      const mockDatesAsSeconds = [123, 345]
      const dateUtilSpy = jest.spyOn(DateTimeFormats, 'isoDateToUIDate')
      const mockLinkHtml = { html: '<a>link</a>' }
      mockDates.forEach(date => dateUtilSpy.mockReturnValueOnce(date))

      const timeUtilSpy = jest.spyOn(AppointmentUtils, 'buildTime')
      mockTimes.forEach(time => timeUtilSpy.mockReturnValueOnce(time))

      const dateAsTimeUtilSpy = jest.spyOn(DateTimeFormats, 'isoToMilliseconds')
      mockDatesAsSeconds.forEach(date => dateAsTimeUtilSpy.mockReturnValueOnce(date))

      const statusTagSpy = jest.spyOn(AppointmentUtils, 'getStatusTag')
      mockStatusTags.forEach(statusTag => statusTagSpy.mockReturnValueOnce(statusTag))

      jest.spyOn(SessionUtils, 'getAppointmentActionCell').mockReturnValue(mockLinkHtml)
      const appointments = appointmentSummaryFactory.buildList(2)

      const result = ProjectPage.appointmentList(appointments, 'someCode', { originalPath: '' })

      expect(result).toEqual([
        [
          { html: offenderHtml },
          { text: mockDates[0], attributes: { 'data-sort-value': mockDatesAsSeconds[0] } },
          { html: mockTimes[0], classes: 'cpb-td-white-space-nowrap' },
          { html: mockStatusTags[0] },
          mockLinkHtml,
        ],
        [
          { html: offenderHtml },
          { text: mockDates[1], attributes: { 'data-sort-value': mockDatesAsSeconds[1] } },
          { html: mockTimes[1], classes: 'cpb-td-white-space-nowrap' },
          { html: mockStatusTags[1] },
          mockLinkHtml,
        ],
      ])

      appointments.forEach(appointment => {
        expect(AppointmentUtils.buildTime).toHaveBeenCalledWith(appointment)
        expect(AppointmentUtils.getStatusTag).toHaveBeenCalledWith(appointment.contactOutcome)

        expect(SessionUtils.getAppointmentActionCell).toHaveBeenCalledWith({
          appointmentId: appointment.id,
          projectCode: 'someCode',
          offender: mockOffender,
          query: { originalPath: '' },
        })
      })
    })
  })

  describe('projectDetails', () => {
    it('should return view data from ProjectDto', () => {
      const address = '12 Hammersmith Road'
      jest.spyOn(LocationUtils, 'locationToString').mockReturnValue(address)
      const project = projectFactory.build()

      const result = ProjectPage.projectDetails(project)

      expect(result).toEqual({
        name: project.projectName,
        address,
        primaryContact: {
          name: project.beneficiaryDetails.contactName,
          email: project.beneficiaryDetails.emailAddress,
          phone: project.beneficiaryDetails.telephoneNumber,
        },
      })
    })

    it('should return null if any property null', () => {
      const beneficiaryDetails = beneficiaryDetailsFactory.build({
        emailAddress: null,
        contactName: 'Someone',
        telephoneNumber: null,
      })
      const project = projectFactory.build({ beneficiaryDetails })

      const result = ProjectPage.projectDetails(project)

      expect(result.primaryContact).toEqual({
        name: 'Someone',
        email: null,
        phone: null,
      })
    })
  })

  describe('buildNavigation', () => {
    const originalSearch = { provider: 'someProvider', team: 'someTeam' }
    const pathData = { projectCode: 'someCode', query: originalSearch }
    const missingOutcomesPath = pathWithQuery(
      paths.projects.showTab({ projectCode: pathData.projectCode, appointmentSection: 'missing-outcomes' }),
      originalSearch,
    )

    const pastPath = pathWithQuery(
      paths.projects.showTab({ projectCode: pathData.projectCode, appointmentSection: 'past' }),
      originalSearch,
    )

    it('returns the correct active tab', () => {
      expect(ProjectPage.buildNavigation('upcoming', 0, pathData)).toEqual([
        { active: false, href: missingOutcomesPath, html: 'Missing outcomes' },
        { active: false, href: pastPath, html: 'Past appointments' },
      ])
      expect(ProjectPage.buildNavigation('missing-outcomes', 0, pathData)).toEqual([
        { active: true, href: missingOutcomesPath, html: 'Missing outcomes' },
        { active: false, href: pastPath, html: 'Past appointments' },
      ])
      expect(ProjectPage.buildNavigation('past', 0, pathData)).toEqual([
        { active: false, href: missingOutcomesPath, html: 'Missing outcomes' },
        { active: true, href: pastPath, html: 'Past appointments' },
      ])
    })

    it('sets a notification badge on missing outcomes if there are any', () => {
      const badge = `
          <span class="moj-notification-badge">
            <span aria-hidden="true">5</span>
            <span class="govuk-visually-hidden">(5 missing outcomes)</span>
          </span>
        `

      expect(ProjectPage.buildNavigation('missing-outcomes', 5, pathData)).toEqual([
        { active: true, href: missingOutcomesPath, html: `Missing outcomes${badge}` },
        { active: false, href: pastPath, html: 'Past appointments' },
      ])
    })

    it('sets a notification badge on missing outcomes if there are any even with a different active tab', () => {
      const badge = `
          <span class="moj-notification-badge">
            <span aria-hidden="true">5</span>
            <span class="govuk-visually-hidden">(5 missing outcomes)</span>
          </span>
        `

      expect(ProjectPage.buildNavigation('upcoming', 5, pathData)).toEqual([
        { active: false, href: missingOutcomesPath, html: `Missing outcomes${badge}` },
        { active: false, href: pastPath, html: 'Past appointments' },
      ])
    })

    it('sets no notification badge if there are no missing outcomes', () => {
      expect(ProjectPage.buildNavigation('missing-outcomes', 0, pathData)).toEqual([
        { active: true, href: missingOutcomesPath, html: `Missing outcomes` },
        { active: false, href: pastPath, html: 'Past appointments' },
      ])
    })
  })
})
