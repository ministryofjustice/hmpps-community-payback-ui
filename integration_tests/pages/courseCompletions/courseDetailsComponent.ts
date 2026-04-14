import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'

export default class CourseDetailsComponent {
  private readonly details: SummaryListComponent

  constructor(
    private readonly courseCompletion: EteCourseCompletionEventDto,
    private readonly title: string = 'Course details',
  ) {
    this.details = new SummaryListComponent(this.title)
  }

  shouldShowCourseDetails() {
    const expectedTime = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      this.courseCompletion.expectedTimeMinutes,
    )
    const expectedTimeWithAllowance = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      Math.round(this.courseCompletion.expectedTimeMinutes * 1.2),
    )

    const totalTimeSpent = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      this.courseCompletion.totalTimeMinutes,
    )

    const completionDate = DateTimeFormats.isoDateToUIDate(this.courseCompletion.completionDateTime)

    this.details.getValueWithLabel('Completion date').should('contain.text', completionDate)
    this.details.getValueWithLabel('Expected time').should('contain.text', expectedTime)
    this.details.getValueWithLabel('Expected time with 20% allowance').should('contain.text', expectedTimeWithAllowance)
    this.details.getValueWithLabel('Total time spent').should('contain.text', totalTimeSpent)
  }
}
