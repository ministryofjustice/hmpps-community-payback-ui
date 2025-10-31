import { AppointmentDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentOutcomeForm } from '../../../server/@types/user-defined'
import SummaryListComponent from '../components/summaryListComponent'
import { pathWithQuery } from '../../../server/utils/utils'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

export default class ConfirmDetailsPage extends Page {
  private readonly formDetails: SummaryListComponent

  constructor(
    appointment: AppointmentDto,
    private readonly form: AppointmentOutcomeForm,
  ) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
    this.formDetails = new SummaryListComponent()
  }

  static visit(appointment: AppointmentDto, form: AppointmentOutcomeForm, formId: string): ConfirmDetailsPage {
    const path = pathWithQuery(paths.appointments.confirm({ appointmentId: appointment.id.toString() }), {
      form: formId,
    })
    cy.visit(path)

    return new ConfirmDetailsPage(appointment, form)
  }

  shouldShowCompletedDetails(): void {
    this.formDetails.getValueWithLabel('Supervising officer').should('contain.text', this.form.supervisorOfficerCode)
    this.formDetails.getValueWithLabel('Attendance').should('contain.text', this.form.contactOutcome.name)
    this.formDetails.getValueWithLabel('Start and end time').should('contain.text', this.form.startTime)
    this.formDetails.getValueWithLabel('Penalty hours').should('contain.text', '1 hourTotal hours credited: 6 hours')
    this.formDetails.getValueWithLabel('Compliance').should('contain.html', 'High-vis - No<br>Worked intensively - No<br>Work quality - Good<br>Behaviour - Not applicable')
  }

  shouldShowEnforcementDetails(): void {
    this.formDetails.getValueWithLabel('Enforcement').should('contain.text', this.form.enforcement.action.name)
    this.formDetails
      .getValueWithLabel('Respond by')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.form.enforcement.respondBy, { format: 'medium' }))
  }

  shouldNotShowEnforcementDetails(): void {
    this.formDetails.shouldNotContainValueWithLabel('Enforcement')
    this.formDetails.shouldNotContainValueWithLabel('Respond by')
  }

  shouldShowFormTitle() {
    cy.get('h2').should('have.text', 'Confirm details')
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Confirm details')
  }
}
