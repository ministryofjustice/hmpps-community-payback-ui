import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import NotesQuestionComponent from '../components/notesQuestionComponent'
import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class AttendanceOutcomePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'attendance-outcome'

  readonly contactOutcomeOptions: RadioOrCheckboxGroupComponent

  readonly notesQuestions: NotesQuestionComponent

  constructor(context: AppointmentTitleContext) {
    super(context)
    this.contactOutcomeOptions = new RadioOrCheckboxGroupComponent('attendanceOutcome')
    this.notesQuestions = new NotesQuestionComponent()
  }

  completeForm(contactOutcomeCode: string, expectIsSensitiveQuestion = true) {
    this.contactOutcomeOptions.checkOptionWithValue(contactOutcomeCode)
    this.notesQuestions.completeForm(expectIsSensitiveQuestion)
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Log attendance')
  }
}
