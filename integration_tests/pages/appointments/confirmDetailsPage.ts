import { AppointmentDto } from '../../../server/@types/shared'
import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import SummaryListComponent from '../components/summaryListComponent'
import RadioGroupComponent from '../components/radioGroupComponent'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class ConfirmDetailsPage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'confirm-details'

  private readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioGroupComponent

  constructor(
    appointment: AppointmentDto,
    private readonly form: AppointmentOutcomeForm,
  ) {
    super(appointment)
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioGroupComponent('alertPractitioner')
  }

  shouldShowCompletedDetails(): void {
    this.formDetails.getValueWithLabel('Supervising officer').should('contain.text', this.form.supervisor.fullName)
    this.formDetails.getValueWithLabel('Attendance').should('contain.text', this.form.contactOutcome.name)
    this.formDetails.getValueWithLabel('Start and end time').should('contain.text', this.form.startTime)
  }

  shouldShowAttendanceDetails(): void {
    this.formDetails.getValueWithLabel('Penalty hours').should('contain.text', '1 hourTotal hours credited: 6 hours')
    this.formDetails
      .getValueWithLabel('Compliance')
      .should(
        'contain.html',
        'Wore hi-vis - No<br>Working intensively - No<br>Work quality - Good<br>Behaviour - Not applicable',
      )
    this.formDetails.getValueWithLabel('Notes').should('contain.text', 'Test')
    this.formDetails.getValueWithLabel('Sensitive').should('contain.text', 'Not entered')
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

  shouldNotShowAttendanceDetails(): void {
    this.formDetails.shouldNotContainValueWithLabel('Compliance')
  }

  shouldShowFormTitle() {
    cy.get('h2').first().should('have.text', 'Confirm details')
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
}
