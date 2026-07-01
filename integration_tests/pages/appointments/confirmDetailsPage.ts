import { AppointmentOrSession, AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import SummaryListComponent from '../components/summaryListComponent'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'
import { AppointmentDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'

export default class ConfirmDetailsPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'confirm-details'

  private readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioOrCheckboxGroupComponent

  constructor(
    appointment: AppointmentOrSession,
    private readonly form: AppointmentOutcomeForm,
  ) {
    super(appointment)
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioOrCheckboxGroupComponent('alertPractitioner')
  }

  shouldShowCompletedDetails(): void {
    this.formDetails.getValueWithLabel('Supervising officer').should('contain.text', this.form.supervisor.fullName)
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

  clickChange(label: string) {
    this.formDetails.clickActionWithLabel(label)
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
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
