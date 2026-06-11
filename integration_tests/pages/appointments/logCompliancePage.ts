import { AppointmentDto, AttendanceDataDto } from '../../../server/@types/shared'
import RadioGroupComponent from '../components/radioGroupComponent'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class LogCompliancePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'log-compliance'

  private readonly hiVisOptions = new RadioGroupComponent('hiVis')

  private readonly workedIntensivelyOptions = new RadioGroupComponent('workedIntensively')

  private readonly workQualityOptions = new RadioGroupComponent('workQuality')

  private readonly behaviourOptions = new RadioGroupComponent('behaviour')

  constructor(appointment: AppointmentDto) {
    super(appointment)
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
