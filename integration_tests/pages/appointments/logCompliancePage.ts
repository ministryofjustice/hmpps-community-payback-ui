import { AttendanceDataDto } from '../../../server/@types/shared'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class LogCompliancePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'log-compliance'

  private readonly workQualityOptions = new RadioOrCheckboxGroupComponent('workQuality')

  private readonly behaviourOptions = new RadioOrCheckboxGroupComponent('behaviour')

  constructor(context: AppointmentTitleContext) {
    super(context)
  }

  completeForm(): void {
    this.workQualityOptions.checkOptionWithValue('GOOD')
    this.behaviourOptions.checkOptionWithValue('UNSATISFACTORY')
  }

  shouldShowEnteredAnswers(attendanceData: AttendanceDataDto) {
    this.workQualityOptions.shouldHaveSelectedValue(attendanceData.workQuality)
    this.behaviourOptions.shouldHaveSelectedValue(attendanceData.behaviour)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').first().should('have.text', 'Log compliance')
  }

  shouldNotHaveAnySelectedValues() {
    cy.get('input[type="radio"').should('not.be.checked')
  }
}
