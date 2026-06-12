import RadioGroupComponent from '../components/radioGroupComponent'
import NotesQuestionComponent from '../components/notesQuestionComponent'
import { AppointmentOrSession } from '../../../server/@types/user-defined'
import BaseAppointmentFormPage from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class AttendanceOutcomePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'attendance-outcome'

  readonly contactOutcomeOptions: RadioGroupComponent

  readonly notesQuestions: NotesQuestionComponent

  constructor(appointmentOrSession: AppointmentOrSession) {
    super(appointmentOrSession)
    this.contactOutcomeOptions = new RadioGroupComponent('attendanceOutcome')
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
