import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import CourseCompletionUtils from '../../../server/utils/courseCompletionUtils'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'

export default class CompletionDetailsComponent {
  private readonly details: SummaryListComponent

  constructor(private readonly title: string = 'Completion details') {
    this.details = new SummaryListComponent(this.title)
  }

  shouldShowCompletionDetails(courseCompletion: EteCourseCompletionEventDto) {
    const completionDate = DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime)
    const timeSpent = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(courseCompletion.totalTimeMinutes)
    const status = CourseCompletionUtils.formattedCourseCompletionLabel(courseCompletion.status)

    this.details
      .getValueWithLabel(`Attempt ${courseCompletion.attempts}`)
      .should('contain.text', completionDate)
      .should('contain.text', timeSpent)
      .should('contain.text', status)
  }

  shouldShowAttemptPlaceholder({ attempt }: { attempt: number }) {
    this.details
      .getValueWithLabel(`Attempt ${attempt}`)
      .should('contain.text', 'Details in Community Campus')
      .should('contain.text', 'Fail')
  }
}
