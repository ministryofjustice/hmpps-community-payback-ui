import Offender from '../models/offender'
import projectAppointmentSummaryFactory from '../testutils/factories/projectAppointmentSummaryFactory'
import DateTimeFormats from '../utils/dateTimeUtils'
import ProjectPage from './projectPage'

jest.mock('../models/offender')

describe('ProjectPage', () => {
  describe('appointmentListTableRows', () => {
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
    const offenderHtml = '<strong>Sam Smith</strong>'

    beforeEach(() => {
      offenderMock.mockImplementation(() => {
        return {
          name: 'Sam Smith',
          crn: 'CRN123',
          isLimited: false,
          getTableHtml: () => offenderHtml,
        }
      })
      jest.restoreAllMocks()
    })

    it('returns appointment list formatted into table rows', () => {
      const mockDates = ['12 January 2026', '13 January 2025']
      const mockTimes = ['09:00', '10:00', '12:00', '13:00']
      const dateUtilSpy = jest.spyOn(DateTimeFormats, 'isoDateToUIDate')
      mockDates.forEach(date => dateUtilSpy.mockReturnValueOnce(date))

      const timeUtilSpy = jest.spyOn(DateTimeFormats, 'stripTime')
      mockTimes.forEach(time => timeUtilSpy.mockReturnValueOnce(time))

      const appointments = projectAppointmentSummaryFactory.buildList(2)

      const result = ProjectPage.appointmentList(appointments)

      expect(result).toEqual([
        [
          { html: offenderHtml },
          { text: mockDates[0] },
          { text: mockTimes[0] },
          { text: mockTimes[1] },
          { text: appointments[0].daysOverdue },
        ],
        [
          { html: offenderHtml },
          { text: mockDates[1] },
          { text: mockTimes[2] },
          { text: mockTimes[3] },
          { text: appointments[1].daysOverdue },
        ],
      ])
    })
  })
})
