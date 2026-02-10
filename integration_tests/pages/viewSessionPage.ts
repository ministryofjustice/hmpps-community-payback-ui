import { OffenderFullDto, SessionDto } from '../../server/@types/shared'
import paths from '../../server/paths'

import Page from './page'
import SummaryListComponent from './components/summaryListComponent'
import DateTimeFormats from '../../server/utils/dateTimeUtils'
import DataTableComponent from './components/datatableComponent'

export default class ViewSessionPage extends Page {
  private readonly sessionDetails: SummaryListComponent

  private readonly session: SessionDto

  sessionList: DataTableComponent

  constructor(session: SessionDto) {
    super(session.projectName)
    this.sessionDetails = new SummaryListComponent()
    this.sessionList = new DataTableComponent()
    this.session = session
  }

  static visit(session: SessionDto): ViewSessionPage {
    const path = `${paths.sessions.show({ projectCode: session.projectCode, date: session.date })}`
    cy.visit(path)

    return new ViewSessionPage(session)
  }

  clickUpdateAnAppointment() {
    cy.get('a').contains('Update').eq(0).click()
  }

  shouldShowSessionDetails() {
    this.sessionDetails.getValueWithLabel('Date').should(
      'contain.text',
      DateTimeFormats.isoDateToUIDate(this.session.date, {
        format: 'medium',
      }),
    )
    this.sessionDetails.getValueWithLabel('Location').should('contain.text', this.session.location.county)
  }

  shouldShowAppointmentsList() {
    const { appointmentSummaries } = this.session
    const expectedRowValues = appointmentSummaries.map(appointmentSummary => {
      const offender = appointmentSummary.offender as OffenderFullDto

      return [
        `${offender.forename} ${offender.surname}`,
        offender.crn,
        DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.requirementMinutes),
        DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.completedMinutes),
        DateTimeFormats.minutesToHoursAndMinutes(
          appointmentSummary.requirementMinutes -
            appointmentSummary.completedMinutes +
            appointmentSummary.adjustmentMinutes,
        ),
        appointmentSummary.contactOutcome.name,
      ]
    })

    this.sessionList.shouldHaveRowsWithContent(expectedRowValues)
  }

  shouldShowOffendersWithNoNames() {
    const { appointmentSummaries } = this.session
    const expectedRowValues = appointmentSummaries.map(appointmentSummary => {
      return [
        '',
        appointmentSummary.offender.crn,
        DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.requirementMinutes),
        DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.completedMinutes),
        DateTimeFormats.minutesToHoursAndMinutes(
          appointmentSummary.requirementMinutes -
            appointmentSummary.completedMinutes +
            appointmentSummary.adjustmentMinutes,
        ),
        appointmentSummary.contactOutcome.name,
      ]
    })

    this.sessionList.shouldHaveRowsWithContent(expectedRowValues)
  }

  shouldNotHaveUpdateLinksForOffenders() {
    cy.get('a').contains('Update').should('not.exist')
  }

  shouldShowErrorMessage(message: string, messageIsLink: boolean = true) {
    cy.get('[data-testid="session-show-error-summary"]').within(() => {
      if (messageIsLink) {
        cy.get('a').contains(message)
      } else {
        cy.get('li').contains(message)
      }
    })
  }
}
