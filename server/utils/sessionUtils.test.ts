import { OffenderDto, OffenderFullDto, SessionSummariesDto } from '../@types/shared'
import Offender from '../models/offender'
import { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'
import paths from '../paths'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import appointmentSummaryFactory from '../testutils/factories/appointmentSummaryFactory'
import { contactOutcomeFactory } from '../testutils/factories/contactOutcomeFactory'
import pagedMetadataFactory from '../testutils/factories/pagedMetadataFactory'
import sessionFactory from '../testutils/factories/sessionFactory'
import sessionSummaryFactory from '../testutils/factories/sessionSummaryFactory'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import SessionUtils from './sessionUtils'
import { pathWithQuery } from './utils'

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
        content: [allocation],
        page: pagedMetadataFactory.build(),
      }

      const result = SessionUtils.sessionResultTableRows(sessions, { provider: 'X123' } as GroupSessionIndexPageInput)

      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        allocation.projectName,
        `/sessions/${allocation.projectCode}/${allocation.date}?provider=X123`,
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
    const search = { provider: 'provider' }

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
      jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockReturnValue('1 hour')
      jest.spyOn(paths.appointments, 'update').mockReturnValue('/appointment-details')
      jest.spyOn(DateTimeFormats, 'timePeriod').mockReturnValue('09:00 - 17:00')

      const appointments = [appointmentSummaryFactory.build({ contactOutcome: null })]
      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session, search)
      expect(DateTimeFormats.timePeriod).toHaveBeenCalledWith(appointments[0].startTime, appointments[0].endTime)
      expect(result).toEqual([
        [
          { text: 'Sam Smith' },
          { text: 'CRN123' },
          { text: '09:00 - 17:00' },
          { text: '1 hour' },
          { html: mockTag },
          { html: fakeLink },
        ],
      ])
    })

    it('calculates and formats times completed', () => {
      jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockReturnValue('1 hour')
      const appointments = [
        appointmentSummaryFactory.build({ requirementMinutes: 120, completedMinutes: 90, adjustmentMinutes: -20 }),
      ]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session, search)

      expect(DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes).toHaveBeenNthCalledWith(1, 10)

      const row = result[0]
      expect(row[3]).toEqual({ text: '1 hour' })
    })

    it('returns a session row with an appropriate attendance status', () => {
      jest.spyOn(HtmlUtils, 'getStatusTag')

      const attendanceName = 'Attendance - Complied'

      const contactOutcome = contactOutcomeFactory.build({ name: attendanceName })

      const appointments = [appointmentSummaryFactory.build({ contactOutcome })]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session, search)
      const sessionRow = result[0]
      expect(sessionRow[sessionRow.length - 2]).toEqual({ html: attendanceName })
      expect(HtmlUtils.getStatusTag).not.toHaveBeenCalled()
    })

    it("returns a session row with a grey tag containing 'Not entered' if there is no attendance outcome", () => {
      const statusTagHtml = '<span>Not entered</span>'
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(statusTagHtml)

      const offender: OffenderFullDto = {
        crn: 'CRN123',
        forename: 'Sam',
        surname: 'Smith',
        middleNames: [],
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      const appointments = [appointmentSummaryFactory.build({ offender, contactOutcome: null })]

      const session = sessionFactory.build({ appointmentSummaries: appointments })

      const result = SessionUtils.sessionListTableRows(session, search)
      const sessionRow = result[0]
      expect(HtmlUtils.getStatusTag).toHaveBeenCalledWith('Not entered', 'grey')
      expect(sessionRow[sessionRow.length - 2]).toEqual({ html: statusTagHtml })
    })

    it('returns a session row with "View" action link', () => {
      const mockTag = '<strong>Status</strong>'
      const mockHiddenText = '<span></span>'
      jest.spyOn(HtmlUtils, 'getStatusTag').mockReturnValue(mockTag)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
      jest.spyOn(DateTimeFormats, 'totalMinutesToHumanReadableHoursAndMinutes').mockReturnValue('1 hour')
      jest.spyOn(paths.appointments, 'update').mockReturnValue('/appointment-details')

      const appointments = [appointmentSummaryFactory.build({ contactOutcome: null })]
      const session = sessionFactory.build({ appointmentSummaries: appointments })

      SessionUtils.sessionListTableRows(session, search)

      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        `View ${mockHiddenText}`,
        '/appointment-details?provider=provider',
      )
    })
  })

  describe('getAppointmentActionCell', () => {
    const search = { provider: 'provider' }
    it('returns empty text if offender is limited', () => {
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

      const offenderDto: OffenderDto = {
        crn: 'CRN123',
        objectType: 'Limited',
      }
      offenderMock.mockImplementation(() => {
        return {
          name: 'Sam Smith',
          crn: 'CRN123',
          isLimited: true,
        }
      })
      const offender = new Offender(offenderDto)

      const result = SessionUtils.getAppointmentActionCell({
        appointmentId: 1,
        projectCode: '1',
        offender,
        originalSearch: search,
      })
      expect(result).toEqual({ text: '' })
    })

    describe('when offender is not limited', () => {
      it('returns html with View link', () => {
        const appointmentId = 1
        const projectCode = '1'
        const mockHiddenText = '<span></span>'
        const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

        const offenderDto: OffenderDto = {
          crn: 'CRN123',
          objectType: 'Full',
        }
        offenderMock.mockImplementation(() => {
          return {
            name: 'Sam Smith',
            crn: 'CRN123',
            isLimited: false,
          }
        })
        const offender = new Offender(offenderDto)
        jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
        jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
        jest.spyOn(paths.appointments, 'update').mockReturnValue('/appointment-details')

        const result = SessionUtils.getAppointmentActionCell({
          appointmentId,
          projectCode,
          offender,
          originalSearch: search,
        })

        expect(result).toEqual({ html: fakeLink })
        expect(HtmlUtils.getHiddenText).toHaveBeenCalledWith(offender.name)
        expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
          `View ${mockHiddenText}`,
          pathWithQuery(
            paths.appointments.update({
              projectCode,
              appointmentId: appointmentId.toString(),
              page: 'appointment-details',
            }),
            search,
          ),
        )
      })
    })
  })

  describe('selectedPeopleCard', () => {
    it('returns a selected people card with two appointment summary rows', () => {
      const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>

      offenderMock
        .mockImplementationOnce(() => {
          return {
            details: { description: 'Sam Smith (CRN123)' },
          }
        })
        .mockImplementationOnce(() => {
          return {
            details: { description: 'Alex Jones (CRN456)' },
          }
        })

      jest
        .spyOn(DateTimeFormats, 'timePeriod')
        .mockReturnValueOnce('09:00 - 10:00')
        .mockReturnValueOnce('10:30 - 11:30')

      const session = sessionFactory.build()

      const [firstAppointment, secondAppointment] = session.appointmentSummaries

      const selectedAppointments = [
        { id: firstAppointment.id, deliusVersion: '' },
        { id: secondAppointment.id, deliusVersion: '' },
      ]

      const formId = '1'
      const result = SessionUtils.selectedPeopleCard(session, selectedAppointments, formId)

      expect(result).toEqual({
        card: {
          title: { text: 'Selected people', headingLevel: 2 },
          actions: {
            items: [
              {
                href: pathWithQuery(
                  paths.sessions.update({
                    projectCode: session.projectCode,
                    date: session.date,
                    page: 'select-people',
                  }),
                  { form: formId },
                ),
                text: 'Change',
                visuallyHiddenText: 'selected people',
              },
            ],
          },
        },
        rows: [
          {
            key: { text: 'Sam Smith (CRN123)' },
            value: { text: '09:00 - 10:00' },
          },
          {
            key: { text: 'Alex Jones (CRN456)' },
            value: { text: '10:30 - 11:30' },
          },
        ],
        classes: 'govuk-summary-list--no-fixed-width govuk-summary-list--float-values-right',
      })

      expect(DateTimeFormats.timePeriod).toHaveBeenNthCalledWith(
        1,
        firstAppointment.startTime,
        firstAppointment.endTime,
      )
      expect(DateTimeFormats.timePeriod).toHaveBeenNthCalledWith(
        2,
        secondAppointment.startTime,
        secondAppointment.endTime,
      )
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
      const path = SessionUtils.getSessionPath(session, {})

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: session.projectCode, date: session.date })
      expect(path).toBe(`/sessions/${session.projectCode}/${session.date}`)
    })

    it('returns expected path given a SessionDto', () => {
      const session = sessionFactory.build()
      const path = SessionUtils.getSessionPath(session, {})

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: session.projectCode, date: session.date })
      expect(path).toBe(`/sessions/${session.projectCode}/${session.date}`)
    })

    it('returns expected path given an AppointmentDto', () => {
      const appointment = appointmentFactory.build()
      const path = SessionUtils.getSessionPath(appointment, {})

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: appointment.projectCode, date: appointment.date })
      expect(path).toBe(`/sessions/${appointment.projectCode}/${appointment.date}`)
    })

    it('returns expected path when query parameter is not provided', () => {
      const session = sessionSummaryFactory.build()
      const path = SessionUtils.getSessionPath(session)

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: session.projectCode, date: session.date })
      expect(path).toBe(`/sessions/${session.projectCode}/${session.date}`)
    })

    it('returns path with original search params', () => {
      const search = { provider: 'provider', team: 'team' }
      const session = sessionSummaryFactory.build()
      const path = SessionUtils.getSessionPath(session, search)

      expect(paths.sessions.show).toHaveBeenCalledWith({ projectCode: session.projectCode, date: session.date })
      expect(path).toBe(
        pathWithQuery(paths.sessions.show({ projectCode: session.projectCode, date: session.date }), search),
      )
    })
  })
})
