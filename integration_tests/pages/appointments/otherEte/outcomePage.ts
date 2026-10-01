import BaseOtherEteFormPage from './baseOtherEteFormPage'
import { OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'
import RadioOrCheckboxGroupComponent from '../../components/radioOrCheckboxGroupComponent'
import NotesQuestionComponent from '../../components/notesQuestionComponent'
import { OffenderDto } from '../../../../server/@types/shared'

export default class OutcomePage extends BaseOtherEteFormPage {
  protected page: OtherEteFormPage = 'outcome'

  readonly contactOutcomeOptions: RadioOrCheckboxGroupComponent

  readonly notesQuestions: NotesQuestionComponent

  constructor(offender: OffenderDto) {
    super(offender)
    this.contactOutcomeOptions = new RadioOrCheckboxGroupComponent('attendanceOutcome')
    this.notesQuestions = new NotesQuestionComponent()
  }

  private dateInput = () => this.getTextInputById('date')

  private startTimeInput = () => this.getTextInputById('startTime')

  private endTimeInput = () => this.getTextInputById('endTime')

  enterDate(date: string): void {
    this.dateInput().clear()
    this.dateInput().type(date)
  }

  enterStartTime(time: string): void {
    this.startTimeInput().clear()
    this.startTimeInput().type(time)
  }

  enterEndTime(time: string): void {
    this.endTimeInput().clear()
    this.endTimeInput().type(time)
  }

  completeForm(contactOutcomeCode: string): void {
    this.enterDate('20/1/2026')
    this.enterStartTime('09:00')
    this.enterEndTime('17:00')
    this.contactOutcomeOptions.checkOptionWithValue(contactOutcomeCode)
    this.notesQuestions.completeForm()
  }

  shouldShowDateError() {
    this.shouldShowErrorSummary('date', 'Enter or select a date')
  }

  shouldShowStartTimeError() {
    this.shouldShowErrorSummary('startTime', 'Enter a start time')
  }

  shouldShowEndTimeError() {
    this.shouldShowErrorSummary('endTime', 'Enter an end time')
  }

  shouldShowAttendanceOutcomeError() {
    this.shouldShowErrorSummary('attendanceOutcome', 'Select an attendance outcome')
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Log attendance')
  }
}
