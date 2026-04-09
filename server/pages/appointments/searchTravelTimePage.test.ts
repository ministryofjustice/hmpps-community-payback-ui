import { PagedModelAppointmentTaskSummaryDto } from '../../@types/shared'
import Offender from '../../models/offender'
import appointmentSummaryFactory from '../../testutils/factories/appointmentSummaryFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import HtmlUtils from '../../utils/htmlUtils'
import SearchTravelTimePage from './searchTravelTimePage'

jest.mock('../../models/offender')

describe('SearchTravelTimePage', () => {
  const page = new SearchTravelTimePage()
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('validationErrors', () => {
    it('returns no errors if valid query', () => {
      const result = page.validationErrors({
        provider: 'N123',
      })
      expect(result.errors).toEqual({})
      expect(result.hasErrors).toBe(false)
    })

    it('returns an error if no provider code is supplied', () => {
      const result = page.validationErrors({
        provider: undefined,
      })
      expect(result.errors).toEqual({ provider: { text: 'Choose a region' } })
      expect(result.hasErrors).toBe(true)
    })
  })

  describe('getRows', () => {
    it('returns appropriate rows of data', () => {
      const appointment = appointmentSummaryFactory.build()
      const tasks = {
        content: [{ appointment }],
      }

      const htmlAnchorSpy = jest.spyOn(HtmlUtils, 'getAnchor')
      const linkHtml = '<a>link</a>'
      htmlAnchorSpy.mockReturnValue(linkHtml)

      const dateSpy = jest.spyOn(DateTimeFormats, 'isoDateToUIDate')
      const date = '1 Apr 2026'
      dateSpy.mockReturnValue(date)

      const row = SearchTravelTimePage.getRows(tasks as PagedModelAppointmentTaskSummaryDto)[0]

      expect(row[0].text).toEqual(new Offender(appointment.offender).name)
      expect(row[1].text).toEqual(appointment.offender.crn)
      expect(row[2].text).toEqual(date)
      expect(row[3].text).toEqual(appointment.projectTypeName)
      expect(row[4].html).toEqual(linkHtml)
    })

    it('returns empty array with no data', () => {
      const tasks = {}

      expect(SearchTravelTimePage.getRows(tasks)).toEqual([])
    })
  })
})
