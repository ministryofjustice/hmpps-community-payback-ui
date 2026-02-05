import { AppointmentSummaryDto, OffenderDto, OffenderFullDto, SessionSummariesDto } from '../@types/shared'
import Offender from '../models/offender'
import paths from '../paths'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import { contactOutcomeFactory } from '../testutils/factories/contactOutcomeFactory'
import sessionFactory from '../testutils/factories/sessionFactory'
import sessionSummaryFactory from '../testutils/factories/sessionSummaryFactory'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import SessionUtils from './sessionUtils'

jest.mock('../models/offender')

describe('SessionUtils', () => {
  const fakeLink = '<a>link</a>'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('sessionResultTableRows', () => {
    const fakeFormattedDate = '20 January 2026'
    const fakeFormattedTime = '12:00'
    const fakeElement = '<div>project</div>'

    beforeEach(() => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(fakeFormattedDate)
      jest.spyOn(DateTimeFormats, 'stripTime').mockReturnValue(fakeFormattedTime)
      jest.spyOn(HtmlUtils, 'getElementWithContent').mockReturnValue(fakeElement)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(paths.sessions, 'show')
    })

    it('returns session results formatted into expected table rows', () => {
      const allocation = sessionSummaryFactory.build()

      const sessions: SessionSummariesDto = {
        allocations: [allocation],
      }

      const result = SessionUtils.sessionResultTableRows(sessions)

      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        allocation.projectName,
        `/sessions/${allocation.projectCode}/${allocation.date}`,
      )

      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(1, fakeLink)
      expect(HtmlUtils.getElementWithContent).toHaveBeenNthCalledWith(2, allocation.projectCode)

      expect(result).toEqual([
        [
          { html: fakeElement + fakeElement },
          { text: fakeFormattedDate },
          { text: allocation.numberOfOffendersAllocated },
          { text: allocation.numberOfOffendersWithOutcomes },
          { text: allocation.numberOfOffendersWithEA },
        ],
      ])
    })
  })

  describe('sessionListTableRows', () => {
    const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

    beforeEach(() => {
      offenderMock.mockImplementation(() => {
        return {
          name: 'Sam Smith',
          crn: 'CRN123',
          isLimited: false,
        }
      })
      jest.restoreAllMocks()
    })

    it('returns session formatted into expected table rows', () => {
      const mockTag = '<strong>Status</strong>'
      const mockHiddenText = '<span></span>'
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(mockTag)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
      jest.spyOn(DateTimeFormats, 'minutesToHoursAndMinutes').mockReturnValue('1:00')
      jest.spyOn(paths.appointments, 'projectDetails').mockReturnValue('/project-details')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 60,
          adjustmentMinutes: 20,
        },
      ]
      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session)

      expect(HtmlUtils.getHiddenText).toHaveBeenCalledWith(`${offender.forename} ${offender.surname}`)
      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({
        projectCode: session.projectCode,
        appointmentId: '1',
      })
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(`Update ${mockHiddenText}`, '/project-details')

      expect(result).toEqual([
        [
          { text: 'Sam Smith' },
          { text: 'CRN123' },
          { text: '1:00' },
          { text: '1:00' },
          { text: '1:00' },
          { html: mockTag },
          { html: fakeLink },
        ],
      ])
    })

    it('calculates and formats times completed', () => {
      jest.spyOn(DateTimeFormats, 'minutesToHoursAndMinutes').mockReturnValue('1:00')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 90,
          adjustmentMinutes: -20,
        },
      ]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session)

      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(1, 120)
      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(2, 90)
      expect(DateTimeFormats.minutesToHoursAndMinutes).toHaveBeenNthCalledWith(3, 10)

      const row = result[0]
      expect(row[2]).toEqual({ text: '1:00' })
      expect(row[3]).toEqual({ text: '1:00' })
      expect(row[4]).toEqual({ text: '1:00' })
    })

    it('returns session row with no update button if offender is limited', () => {
      offenderMock.mockImplementation(() => {
        return {
          name: '',
          crn: 'CRN123',
          isLimited: true,
        }
      })

      const offender: OffenderDto = {
        crn: 'CRN123',
        objectType: 'Limited',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 60,
          adjustmentMinutes: 20,
        },
      ]
      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session)
      const sessionRow = result[0]
      expect(sessionRow[sessionRow.length - 1]).toEqual({ text: '' })
    })

    it('returns a session row with an appropriate attendance status', () => {
      jest.spyOn(HtmlUtils, 'getStatusTag')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      const attendanceName = 'Attendance - Complied'

      const contactOutcome = contactOutcomeFactory.build({ name: attendanceName })

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 90,
          adjustmentMinutes: 0,
          contactOutcome,
        },
      ]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session)
      const sessionRow = result[0]
      expect(sessionRow[sessionRow.length - 2].html).toEqual(attendanceName)
      expect(HtmlUtils.getStatusTag).not.toHaveBeenCalled()
    })

    it("returns a session row with a grey tag containing 'Not entered' if there is no attendance outcome", () => {
      jest.spyOn(HtmlUtils, 'getStatusTag')

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      const appointments: AppointmentSummaryDto[] = [
        {
          id: 1,
          offender,
          requirementMinutes: 120,
          completedMinutes: 90,
          adjustmentMinutes: 0,
        },
      ]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session)
      const sessionRow = result[0]
      expect(HtmlUtils.getStatusTag).toHaveBeenCalled()
      expect(sessionRow[sessionRow.length - 2].html).toMatch(/grey.+Not entered/)
    })
  })

  describe('getSessionLink', () => {
    beforeEach(() => {
      jest.spyOn(paths.sessions, 'show')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('returns expected path given a SessionSummaryDto', () => {
      const session = sessionSummaryFactory.build()
      const path = SessionUtils.getSessionPath(session)

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: session.projectCode, date: session.date })
      expect(path).toBe(`/sessions/${session.projectCode}/${session.date}`)
    })

    it('returns expected path given an AppointmentDto', () => {
      const appointment = appointmentFactory.build()
      const path = SessionUtils.getSessionPath(appointment)

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode, date: appointment.date })
      expect(path).toBe(`/sessions/${appointment.projectCode}/${appointment.date}`)
    })
  })
})
