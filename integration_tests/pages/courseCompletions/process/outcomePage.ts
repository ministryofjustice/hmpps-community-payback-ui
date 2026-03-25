import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import CourseDetailsComponent from '../courseDetailsComponent'
import NotesQuestionComponent from '../../components/notesQuestionComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class OutcomePage extends BaseCourseCompletionsPage {
  readonly notesQuestions = new NotesQuestionComponent()

  readonly courseDetails: CourseDetailsComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super('Record an outcome')
    this.courseDetails = new CourseDetailsComponent(this.courseCompletion)
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new OutcomePage(courseCompletion)
  }

  enterCreditedHours() {
    this.getTextInputByIdAndEnterDetails('hours', '1')
    this.getTextInputByIdAndEnterDetails('minutes', '30')
  }

  enterAppointmentDate(day: string, month: string, year: string) {
    this.getTextInputByIdAndEnterDetails('date-day', day)
    this.getTextInputByIdAndEnterDetails('date-month', month)
    this.getTextInputByIdAndEnterDetails('date-year', year)
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('hours', 'Enter hours and minutes for credited hours')
    this.shouldShowErrorSummary('date-day', 'Appointment date must include a day, month and year')
  }
}
