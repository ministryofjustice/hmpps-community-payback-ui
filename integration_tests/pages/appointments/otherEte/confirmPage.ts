import SummaryListComponent from '../../components/summaryListComponent'
import RadioOrCheckboxGroupComponent from '../../components/radioOrCheckboxGroupComponent'
import BaseOtherEteFormPage from './baseOtherEteFormPage'
import { OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'
import { OffenderDto } from '../../../../server/@types/shared'
import { CreateAppointmentForm } from '../../../../server/services/forms/appointmentFormService'

export default class ConfirmPage extends BaseOtherEteFormPage {
  protected page: OtherEteFormPage = 'confirm'

  readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioOrCheckboxGroupComponent

  constructor(offender: OffenderDto) {
    super(offender)
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioOrCheckboxGroupComponent('alertPractitioner')
  }

  shouldShowCompletedDetails(form: CreateAppointmentForm): void {
    this.formDetails.getValueWithLabel('Project team').should('contain.text', form.projectTeam.name)
    this.formDetails.getValueWithLabel('Project', { exact: true }).should('contain.text', form.project.name)
    this.formDetails.getValueWithLabel('Outcome').should('contain.text', form.contactOutcome.name)
    this.formDetails
      .getValueWithLabel('Start and end time')
      .should('contain.text', form.startTime)
      .should('contain.text', form.endTime)
    this.formDetails
      .getValueWithLabel('Compliance')
      .should('contain.html', 'Work quality - Good<br>Behaviour - Not applicable')
  }

  shouldShowValidationError() {
    this.shouldShowErrorSummary('alertpractitioner', 'Choose whether you want to send an alert')
  }

  clickChange(label: string, options?: { exact: boolean }) {
    this.formDetails.clickActionWithLabel(label, options)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').first().should('have.text', 'Confirm details')
  }
}
