import { AppointmentDto, AttendanceDataDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import Page from '../page'
import Offender from '../../../server/models/offender'
import { pathWithQuery } from '../../../server/utils/utils'
import RadioGroupComponent from '../components/radioGroupComponent'

export default class LogCompliancePage extends Page {
  private readonly hiVisOptions = new RadioGroupComponent('hiVis')

  private readonly workedIntensivelyOptions = new RadioGroupComponent('workedIntensively')

  private readonly workQualityOptions = new RadioGroupComponent('workQuality')

  private readonly behaviourOptions = new RadioGroupComponent('behaviour')

  private notesField = () => this.getTextInputById('notes')

  constructor(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(appointment: AppointmentDto): LogCompliancePage {
    const path = pathWithQuery(
      paths.appointments.logCompliance({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      {
        form: '123',
      },
    )
    cy.visit(path)

    return new LogCompliancePage(appointment)
  }

  completeForm(): void {
    this.hiVisOptions.checkOptionWithValue('yes')
    this.workedIntensivelyOptions.checkOptionWithValue('no')
    this.workQualityOptions.checkOptionWithValue('GOOD')
    this.behaviourOptions.checkOptionWithValue('UNSATISFACTORY')
    this.notesField().type('Attendance notes')
  }

  shouldShowNotes(text: string) {
    this.notesField().should('have.value', text)
  }

  shouldShowEnteredAnswers(attendanceData: AttendanceDataDto) {
    this.hiVisOptions.shouldHaveSelectedValue(attendanceData.hiVisWorn ? 'yes' : 'no')
    this.workedIntensivelyOptions.shouldHaveSelectedValue(attendanceData.workedIntensively ? 'yes' : 'no')
    this.workQualityOptions.shouldHaveSelectedValue(attendanceData.workQuality)
    this.behaviourOptions.shouldHaveSelectedValue(attendanceData.behaviour)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('have.text', 'Log compliance')
  }

  shouldNotHaveAnySelectedValues() {
    cy.get('input[type="radio"').should('not.be.checked')
  }
}
