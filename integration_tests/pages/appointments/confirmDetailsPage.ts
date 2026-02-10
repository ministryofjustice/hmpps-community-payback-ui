import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import SummaryListComponent from '../components/summaryListComponent'
import { pathWithQuery } from '../../../server/utils/utils'
import RadioGroupComponent from '../components/radioGroupComponent'

export default class ConfirmDetailsPage extends Page {
  private readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioGroupComponent

  constructor(
    appointment: AppointmentDto,
    private readonly form: AppointmentOutcomeForm,
  ) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioGroupComponent('alertPractitioner')
  }

  static visit(appointment: AppointmentDto, form: AppointmentOutcomeForm, formId: string): ConfirmDetailsPage {
    const path = pathWithQuery(
      paths.appointments.confirm({ projectCode: appointment.projectCode, appointmentId: appointment.id.toString() }),
      {
        form: formId,
      },
    )
    cy.visit(path)

    return new ConfirmDetailsPage(appointment, form)
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
        'High-vis - No<br>Worked intensively - No<br>Work quality - Good<br>Behaviour - Not applicable',
      )
    this.formDetails.getValueWithLabel('Notes').should('contain.text', 'Test')
  }

  shouldNotShowAttendanceDetails(): void {
    this.formDetails.shouldNotContainValueWithLabel('Compliance')
  }

  shouldShowFormTitle() {
    cy.get('h2').should('have.text', 'Confirm details')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Confirm details')
  }

  clickChange(label: string) {
    this.formDetails.clickActionWithLabel(label)
  }
}
