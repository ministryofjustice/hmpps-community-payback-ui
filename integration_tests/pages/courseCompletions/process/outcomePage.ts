import { EteCourseCompletionEventDto, UnpaidWorkDetailsDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import CourseDetailsComponent from '../courseDetailsComponent'
import NotesQuestionComponent from '../../components/notesQuestionComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'
import SummaryListComponent from '../../components/summaryListComponent'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'

export default class OutcomePage extends BaseCourseCompletionsPage {
  readonly notesQuestions = new NotesQuestionComponent()

  readonly courseDetails: CourseDetailsComponent

  private readonly requirementDetails: SummaryListComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super('Record an outcome')
    this.courseDetails = new CourseDetailsComponent(this.courseCompletion, 'Community Campus record')
    this.requirementDetails = new SummaryListComponent('Unpaid work requirement')
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

  shouldShowRequirementDetails(upwDetail: UnpaidWorkDetailsDto) {
    const totalHoursOrdered = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(upwDetail.requiredMinutes)
    const totalHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      upwDetail.requiredMinutes - upwDetail.completedMinutes,
    )
    const maximumEteHours = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(upwDetail.allowedEteMinutes)
    const eteHoursCredited = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(upwDetail.completedEteMinutes)
    const eteHoursRemaining = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(upwDetail.remainingEteMinutes)

    this.requirementDetails.getValueWithLabel('Total hours ordered').should('contain.text', totalHoursOrdered)
    this.requirementDetails.getValueWithLabel('Total hours remaining').should('contain.text', totalHoursRemaining)
    this.requirementDetails.getValueWithLabel('Maximum ETE hours').should('contain.text', maximumEteHours)
    this.requirementDetails.getValueWithLabel('ETE time credited').should('contain.text', eteHoursCredited)
    this.requirementDetails.getValueWithLabel('ETE time remaining').should('contain.text', eteHoursRemaining)
  }
}
