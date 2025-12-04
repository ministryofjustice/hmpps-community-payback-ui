import { AppointmentSummaryDto, OffenderFullDto, SessionDto } from '../../server/@types/shared'
import paths from '../../server/paths'

import Page from './page'
import SummaryListComponent from './components/summaryListComponent'
import DateTimeFormats from '../../server/utils/dateTimeUtils'

export default class ViewSessionPage extends Page {
  private readonly sessionDetails: SummaryListComponent

  private readonly session: SessionDto

  constructor(session: SessionDto) {
    super(session.projectName)
    this.sessionDetails = new SummaryListComponent()
    this.session = session
  }

  static visit(session: SessionDto): ViewSessionPage {
    const path = `${paths.sessions.show({ projectCode: session.projectCode })}?date=${session.date}`
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
    this.sessionDetails.getValueWithLabel('Location').should('contain.text', this.session.projectLocation)
  }

  shouldShowAppointmentsList() {
    const { appointmentSummaries } = this.session

    cy.get('tr')
      .eq(1)
      .within(() => {
        this.shouldShowAppointmentDetails(appointmentSummaries[0])
      })

    cy.get('tr')
      .eq(2)
      .within(() => {
        this.shouldShowAppointmentDetails(appointmentSummaries[1])
      })
  }

  shouldShowOffendersWithNoNames() {
    const { appointmentSummaries } = this.session

    cy.get('tr')
      .eq(1)
      .within(() => {
        this.shouldShowLimitedAppointmentDetails(appointmentSummaries[0])
      })

    cy.get('tr')
      .eq(2)
      .within(() => {
        this.shouldShowLimitedAppointmentDetails(appointmentSummaries[1])
      })
  }

  shouldNotHaveUpdateLinksForOffenders() {
    cy.get('a').contains('Update').should('not.exist')
  }

  private shouldShowAppointmentDetails(appointmentSummary: AppointmentSummaryDto) {
    const offender = appointmentSummary.offender as OffenderFullDto

    cy.get('td').eq(0).should('have.text', `${offender.forename} ${offender.surname}`)
    cy.get('td').eq(1).should('have.text', offender.crn)
    cy.get('td')
      .eq(2)
      .should('have.text', DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.requirementMinutes))
    cy.get('td')
      .eq(3)
      .should('have.text', DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.completedMinutes))
    cy.get('td')
      .eq(4)
      .should(
        'have.text',
        DateTimeFormats.minutesToHoursAndMinutes(
          appointmentSummary.requirementMinutes -
            appointmentSummary.completedMinutes +
            appointmentSummary.adjustmentMinutes,
        ),
      )
    cy.get('td').eq(5).should('have.text', 'Not entered')
  }

  private shouldShowLimitedAppointmentDetails(appointmentSummary: AppointmentSummaryDto) {
    cy.get('td').eq(0).should('have.text', '')
    cy.get('td').eq(1).should('have.text', appointmentSummary.offender.crn)
    cy.get('td')
      .eq(2)
      .should('have.text', DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.requirementMinutes))
    cy.get('td')
      .eq(3)
      .should('have.text', DateTimeFormats.minutesToHoursAndMinutes(appointmentSummary.completedMinutes))
    cy.get('td')
      .eq(4)
      .should(
        'have.text',
        DateTimeFormats.minutesToHoursAndMinutes(
          appointmentSummary.requirementMinutes -
            appointmentSummary.completedMinutes +
            appointmentSummary.adjustmentMinutes,
        ),
      )
    cy.get('td').eq(5).should('have.text', 'Not entered')
  }
}
