import { AttendanceDataDto, OffenderDto } from '../../../../server/@types/shared'
import RadioOrCheckboxGroupComponent from '../../components/radioOrCheckboxGroupComponent'
import BaseOtherEteFormPage from './baseOtherEteFormPage'
import { OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'

export default class CompliancePage extends BaseOtherEteFormPage {
  protected page: OtherEteFormPage = 'compliance'

  private readonly workQualityOptions = new RadioOrCheckboxGroupComponent('workQuality')

  private readonly behaviourOptions = new RadioOrCheckboxGroupComponent('behaviour')

  constructor(offender: OffenderDto) {
    super(offender)
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
}
