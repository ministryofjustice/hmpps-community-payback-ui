import { AttendanceDataDto } from '../../../server/@types/shared'
import { AppointmentOrSession } from '../../../server/@types/user-defined'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class LogCompliancePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'log-compliance'

  private readonly hiVisOptions = new RadioOrCheckboxGroupComponent('hiVis')

  private readonly workedIntensivelyOptions = new RadioOrCheckboxGroupComponent('workedIntensively')

  private readonly workQualityOptions = new RadioOrCheckboxGroupComponent('workQuality')

  private readonly behaviourOptions = new RadioOrCheckboxGroupComponent('behaviour')

  constructor(appointmentOrSession: AppointmentOrSession) {
    super(appointmentOrSession)
  }

  completeForm(): void {
    this.hiVisOptions.checkOptionWithValue('yes')
    this.workedIntensivelyOptions.checkOptionWithValue('no')
    this.workQualityOptions.checkOptionWithValue('GOOD')
    this.behaviourOptions.checkOptionWithValue('UNSATISFACTORY')
  }

  shouldShowEnteredAnswers(attendanceData: AttendanceDataDto) {
    this.hiVisOptions.shouldHaveSelectedValue(attendanceData.hiVisWorn ? 'yes' : 'no')
    this.workedIntensivelyOptions.shouldHaveSelectedValue(attendanceData.workedIntensively ? 'yes' : 'no')
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
