import SummaryListComponent from '../components/summaryListComponent'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'
import { AppointmentDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import { AppointmentOutcomeForm } from '../../../server/services/forms/appointmentFormService'

export default class ConfirmDetailsPage extends BaseAppointmentFormPage {
  private readonly outcomeErrorMessage = 'You can only create appointments with an attended outcome'

  protected override page: AppointmentFormPage = 'confirm-details'

  readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioOrCheckboxGroupComponent

  constructor(
    context: AppointmentTitleContext,
    private readonly form: AppointmentOutcomeForm,
  ) {
    super(context)
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioOrCheckboxGroupComponent('alertPractitioner')
  }

  shouldShowCompletedDetails(): void {
    this.formDetails.getValueWithLabel('Supervising officer').should('contain.text', this.form.supervisor.fullName)
    this.formDetails.getValueWithLabel('Project team').should('contain.text', this.form.projectTeam.name)
    this.formDetails.getValueWithLabel('Project', { exact: true }).should('contain.text', this.form.project.name)

    this.formDetails.getValueWithLabel('Outcome').should('contain.text', this.form.contactOutcome.name)
  }

  shouldShowAttendanceDetails(expectIsSensitiveAnswer: boolean): void {
    this.formDetails
      .getValueWithLabel('Start and end time')
      .should('contain.text', this.form.startTime)
      .should('contain.text', this.form.endTime)

    this.formDetails
      .getValueWithLabel('Compliance')
      .should('contain.html', 'Work quality - Good<br>Behaviour - Not applicable')
    this.formDetails.getValueWithLabel('Notes').should('contain.text', 'Test')

    if (expectIsSensitiveAnswer) {
      this.formDetails.getValueWithLabel('Sensitive').should('contain.text', 'Not entered')
    }
  }

  shouldShowHoursCreditedText(text: string) {
    cy.get('p').contains('Hours credited').should('contain.text', text)
  }

  shouldShowDate(date: string) {
    this.formDetails.getValueWithLabel('Date').should('contain.text', date)
  }

  shouldShowRegionItem(regionName: string) {
    this.formDetails.getValueWithLabel('Region').should('contain.text', regionName)
  }

  shouldNotShowRegionItem(): void {
    this.formDetails.shouldNotContainRowWithLabel('Region')
  }

  shouldShowAlertPractitionerMessage() {
    cy.get('div')
      .contains('This outcome will be shared with the practitioner as it requires enforcement action.')
      .should('be.visible')
  }

  shouldNotShowAlertPractitionerMessage() {
    cy.get('div')
      .contains('This outcome will be shared with the practitioner as it requires enforcement action.')
      .should('not.exist')
  }

  shouldNotShowSensitiveQuestion() {
    this.formDetails.shouldNotContainValueWithLabel('Sensitive')
  }

  shouldNotShowAttendanceDetails(): void {
    this.formDetails.shouldNotContainRowWithLabel('Start and end time')
    this.formDetails.shouldNotContainValueWithLabel('Compliance')
  }

  shouldNotShowRequirementItem(): void {
    this.formDetails.shouldNotContainRowWithLabel('Requirement')
  }

  shouldShowRequirementItem(): void {
    this.formDetails.getValueWithLabel('Requirement').should('exist')
  }

  shouldShowPersonItem(): void {
    this.formDetails.getValueWithLabel('Person').should('exist')
  }

  shouldNotShowPersonItem(): void {
    this.formDetails.shouldNotContainRowWithLabel('Person')
  }

  shouldShowFormTitle() {
    cy.get('h2').first().should('have.text', 'Confirm details')
  }

  shouldShowSelectedPeople(appointments: Array<Pick<AppointmentDto, 'offender'>>) {
    this.formDetails
      .getValueWithLabel('People')
      .should('contain.text', this.buildExpectedPeopleText(appointments).join(' '))
  }

  shouldNotShowSelectedPeople(appointments: Array<Pick<AppointmentDto, 'offender'>>) {
    this.formDetails
      .getValueWithLabel('People')
      .should('not.contain.text', this.buildExpectedPeopleText(appointments).join(' '))
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').first().should('have.text', 'Confirm details')
  }

  clickOutcomeError() {
    cy.get(`[role="alert"]`).find('a').contains(this.outcomeErrorMessage).click()
  }

  clickChange(label: string, options?: { exact: boolean }) {
    this.formDetails.clickActionWithLabel(label, options)
  }

  shouldShowAPIError(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  shouldShowAlertPractitionerError() {
    cy.get(`[data-cy-error-alertpractitioner]`).should('contain', 'Choose whether you want to send an alert')
  }

  shouldShowAttendedOutcomeError() {
    this.shouldShowErrorSummary('outcome', this.outcomeErrorMessage)
  }

  shouldNotShowChangeLink(label: string) {
    this.formDetails.shouldNotContainAction(label)
  }

  shouldShowSensitiveValue(value: string) {
    this.formDetails.getValueWithLabel('Sensitive').should('contain.text', value)
  }

  private buildExpectedPeopleText(appointments: Pick<AppointmentDto, 'offender'>[]) {
    return appointments.map(appointment => new Offender(appointment.offender).details.description)
  }
}
