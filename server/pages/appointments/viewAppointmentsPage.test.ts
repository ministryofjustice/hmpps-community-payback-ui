import DateTimeFormats from '../../utils/dateTimeUtils'
import { ViewAppointmentsPage } from './viewAppointmentsPage'
import appointmentSummaryFactory from '../../testutils/factories/appointmentSummaryFactory'
import HtmlUtils from '../../utils/htmlUtils'
import { AppointmentsSortField, SortDirection, TableCell } from '../../@types/user-defined'
import sortHeader from '../../utils/sortHeader'
import paths from '../../paths'
import * as Utils from '../../utils/utils'

jest.mock('../../utils/sortHeader')
const sortHeaderMock = sortHeader as jest.MockedFunction<typeof sortHeader>

describe('ViewAppointmentsPage', () => {
  describe('buildAppointmentList', () => {
    it('returns the correct rows', () => {
      const appointments = appointmentSummaryFactory.buildList(5)

      const date = '1 Apr 2026'
      const milliDate = +new Date()
      const time = '09:00'
      const tag = '<span>tag</span>'
      const anchor = '<a>link</a>'
      const originalPath = '/some-path'
      const encodedPath = '/path?originalPath=some-path'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(date)
      jest.spyOn(DateTimeFormats, 'isoToMilliseconds').mockReturnValue(milliDate)
      jest.spyOn(DateTimeFormats, 'stripTime').mockReturnValue(time)
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(tag)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(anchor)
      jest.spyOn(Utils, 'pathWithOriginalPath').mockReturnValue(encodedPath)

      const result = ViewAppointmentsPage.buildAppointmentList(appointments, originalPath)

      expect(result).toEqual(
        appointments.map(appointment => {
          return [
            {
              text: date,
              attributes: {
                'data-sort-value': milliDate,
              },
            },
            {
              text: appointment.projectName,
            },
            {
              text: appointment.projectTypeName,
            },
            {
              text: `${time} - ${time}`,
            },
            {
              html: tag,
            },
            {
              html: anchor,
            },
          ]
        }),
      )
      expect(Utils.pathWithOriginalPath).toHaveBeenCalledWith(
        paths.appointments.update({
          projectCode: appointments[0].projectCode,
          appointmentId: appointments[0].id.toString(),
          page: 'appointment-details',
        }),
        originalPath,
      )
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith('View', encodedPath)
    })
  })

  describe('buildNavigation', () => {
    it('returns the correct active tab', () => {
      expect(ViewAppointmentsPage.buildNavigation('upcoming', 0)).toEqual([
        { active: true, href: 'upcoming', html: 'Upcoming appointments' },
        { active: false, href: 'missing-outcomes', html: 'Missing outcomes' },
        { active: false, href: 'past', html: 'Past appointments' },
      ])
      expect(ViewAppointmentsPage.buildNavigation('missing-outcomes', 0)).toEqual([
        { active: false, href: 'upcoming', html: 'Upcoming appointments' },
        { active: true, href: 'missing-outcomes', html: 'Missing outcomes' },
        { active: false, href: 'past', html: 'Past appointments' },
      ])
      expect(ViewAppointmentsPage.buildNavigation('past', 0)).toEqual([
        { active: false, href: 'upcoming', html: 'Upcoming appointments' },
        { active: false, href: 'missing-outcomes', html: 'Missing outcomes' },
        { active: true, href: 'past', html: 'Past appointments' },
      ])
    })

    it('sets a notification badge on missing outcomes if there are any', () => {
      const badge = `
        <span class="moj-notification-badge">
          <span aria-hidden="true">5</span>
          <span class="govuk-visually-hidden">(5 missing outcomes)</span>
        </span>
      `

      expect(ViewAppointmentsPage.buildNavigation('missing-outcomes', 5)).toEqual([
        { active: false, href: 'upcoming', html: 'Upcoming appointments' },
        { active: true, href: 'missing-outcomes', html: `Missing outcomes${badge}` },
        { active: false, href: 'past', html: 'Past appointments' },
      ])
    })

    it('sets a notification badge on missing outcomes if there are any even with a different active tab', () => {
      const badge = `
        <span class="moj-notification-badge">
          <span aria-hidden="true">5</span>
          <span class="govuk-visually-hidden">(5 missing outcomes)</span>
        </span>
      `

      expect(ViewAppointmentsPage.buildNavigation('upcoming', 5)).toEqual([
        { active: true, href: 'upcoming', html: 'Upcoming appointments' },
        { active: false, href: 'missing-outcomes', html: `Missing outcomes${badge}` },
        { active: false, href: 'past', html: 'Past appointments' },
      ])
    })

    it('sets no notification badge if there are no missing outcomes', () => {
      expect(ViewAppointmentsPage.buildNavigation('missing-outcomes', 0)).toEqual([
        { active: false, href: 'upcoming', html: 'Upcoming appointments' },
        { active: true, href: 'missing-outcomes', html: `Missing outcomes` },
        { active: false, href: 'past', html: 'Past appointments' },
      ])
    })
  })

  describe('tableHeaders', () => {
    const hrefPrefix = 'someHrefPrefix'

    const dateHeader: TableCell = {
      html: '<a>Date</a>',
      attributes: {
        'aria-sort': 'none',
        'data-cy-sort-field': 'date',
      },
    }

    beforeEach(() => {
      jest.resetAllMocks()
      sortHeaderMock.mockReturnValue(dateHeader)
    })

    it('sends the correct table headers', () => {
      const sortBy: AppointmentsSortField | AppointmentsSortField[] = undefined
      const sortDirection: SortDirection = undefined
      expect(ViewAppointmentsPage.tableHeaders(sortBy, sortDirection, hrefPrefix)).toEqual([
        dateHeader,
        { text: 'Project' },
        { text: 'Project type' },
        { text: 'Time' },
        { text: 'Attendance' },
        { text: 'Action' },
      ])
      expect(sortHeaderMock).toHaveBeenCalledWith('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results')
    })

    it('sends the correct table headers when given a value for sortBy', () => {
      const sortBy: AppointmentsSortField | AppointmentsSortField[] = 'date'
      const sortDirection: SortDirection = undefined
      expect(ViewAppointmentsPage.tableHeaders(sortBy, sortDirection, hrefPrefix)).toEqual([
        dateHeader,
        { text: 'Project' },
        { text: 'Project type' },
        { text: 'Time' },
        { text: 'Attendance' },
        { text: 'Action' },
      ])
      expect(sortHeaderMock).toHaveBeenCalledWith('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results')
    })

    it('sends the correct table headers when given a value for sortDirection', () => {
      const sortBy: AppointmentsSortField | AppointmentsSortField[] = 'date'
      const sortDirection: SortDirection = 'desc'
      expect(ViewAppointmentsPage.tableHeaders(sortBy, sortDirection, hrefPrefix)).toEqual([
        dateHeader,
        { text: 'Project' },
        { text: 'Project type' },
        { text: 'Time' },
        { text: 'Attendance' },
        { text: 'Action' },
      ])
      expect(sortHeaderMock).toHaveBeenCalledWith('Date', 'date', sortBy, sortDirection, hrefPrefix, 'search-results')
    })
  })
})
