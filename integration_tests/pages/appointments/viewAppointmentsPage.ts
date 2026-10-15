import { AdjustmentDto, AppointmentSummaryDto, OffenderFullDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import DataTableComponent from '../components/datatableComponent'
import UnpaidWorkHoursCardsComponent from '../components/unpaidWorkHoursCardsComponent'
import Page from '../page'

export default class ViewAppointmentsPage extends Page {
  appointmentsList: DataTableComponent

  unpaidWorkHoursCards: UnpaidWorkHoursCardsComponent

  adjustmentsList: DataTableComponent

  constructor(offender: Offender) {
    super(offender.name)
    this.appointmentsList = new DataTableComponent()
    this.adjustmentsList = new DataTableComponent()
    this.unpaidWorkHoursCards = new UnpaidWorkHoursCardsComponent()
  }

  static visit(
    _offender: OffenderFullDto,
    deliusEventNumber: string,
    appointmentSection: string,
  ): ViewAppointmentsPage {
    const offender = new Offender(_offender)

    const path = paths.people.appointments({
      crn: offender.crn,
      deliusEventNumber,
      appointmentSection,
    })

    return this.visitAndCheck(path, offender)
  }

  clickViewFirstAppointment() {
    cy.get('.govuk-table__cell a').first().click()
  }

  clickAddAppointment() {
    cy.get('a').contains('Add an appointment').click()
  }

  clickAdjustHours() {
    cy.get('a').contains('Adjust hours').click()
  }

  clickPastAppointmentsTab() {
    cy.get('a.moj-sub-navigation__link').contains('Past appointments').click()
  }

  clickAdjustmentsTab() {
    cy.get('a.moj-sub-navigation__link').contains('Adjustments').click()
  }

  clickDeleteAdjustment(adjustment: AdjustmentDto) {
    cy.contains('tr', adjustment.reason).within(() => {
      cy.get('a').contains('Delete').click()
    })
  }

  shouldBeOnAdjustmentsTab() {
    cy.get('a.moj-sub-navigation__link[aria-current="page"]').should('contain.text', 'Adjustments')
  }

  shouldShowAppointmentsList(appointments: AppointmentSummaryDto[]) {
    const expectedRowValues = appointments.map(appointment => {
      const outcome = appointment.contactOutcome

      return [
        DateTimeFormats.isoDateToUIDate(appointment.date),
        appointment.projectName,
        appointment.projectTypeName,
        `${DateTimeFormats.stripTime(appointment.startTime)} - ${DateTimeFormats.stripTime(appointment.endTime)}`,
        outcome ? outcome.name : 'Not entered',
        'View',
      ]
    })

    this.appointmentsList.shouldHaveRowsWithContent(expectedRowValues)
  }

  shouldShowAdjustmentsList(adjustments: AdjustmentDto[]) {
    const expectedRowValues = adjustments.map(adjustment => {
      return [
        DateTimeFormats.isoDateToUIDate(adjustment.date),
        adjustment.reason,
        DateTimeFormats.formatAdjustmentTime(adjustment.amount),
        adjustment.id ? 'Delete' : '',
      ]
    })

    this.adjustmentsList.shouldHaveRowsWithContent(expectedRowValues)
  }

  shouldHaveChangeLink() {
    cy.get('a').contains('Change').should('exist')
  }

  shouldHaveNoChangeLink() {
    cy.get('a').contains('Change').should('not.exist')
  }

  shouldHaveNotificationBadgeWithCount(n: number) {
    cy.get('.moj-notification-badge').contains(n).should('exist')
  }

  shouldShowAlertMessageWithText(text: string) {
    cy.get('.moj-alert__content').contains(text).should('exist')
  }

  protected override customCheckOnPage(): void {
    cy.get('a.moj-sub-navigation__link').contains('Past appointments')
  }
}
