import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'
import dateTimeUtils from '../../../server/utils/dateTimeUtils'
import { CourseCompletionPageInput } from '../../../server/pages/courseCompletionIndexPage'
import { pathWithQuery } from '../../../server/utils/utils'
import CourseCompletionUtils from '../../../server/utils/courseCompletionUtils'

export default class CourseCompletionPage extends Page {
  private learnerDetails: SummaryListComponent

  private courseDetails: SummaryListComponent

  private completionDetails: SummaryListComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super(`${courseCompletion.firstName} ${courseCompletion.lastName}`)
    this.learnerDetails = new SummaryListComponent('Learner details')
    this.courseDetails = new SummaryListComponent('Course details')
    this.completionDetails = new SummaryListComponent('Completion details')
  }

  static visit(
    courseCompletion: EteCourseCompletionEventDto,
    searchParams?: CourseCompletionPageInput,
  ): CourseCompletionPage {
    const path = pathWithQuery(paths.courseCompletions.show({ id: courseCompletion.id }), searchParams)
    cy.visit(path)

    return new CourseCompletionPage(courseCompletion)
  }

  shouldShowCourseCompletionDetails() {
    const summaryLists = [this.learnerDetails, this.courseDetails, this.completionDetails]

    const learnerMap: { [index: string]: string } = {
      'First name': this.courseCompletion.firstName,
      'Last name': this.courseCompletion.lastName,
      'Date of birth': dateTimeUtils.isoDateToUIDate(this.courseCompletion.dateOfBirth),
      Email: this.courseCompletion.email,
      Region: this.courseCompletion.region,
      PDU: this.courseCompletion.pdu.name,
      Office: this.courseCompletion.office,
    }

    const expected = dateTimeUtils.totalMinutesToHoursAndMinutesParts(this.courseCompletion.expectedTimeMinutes)
    const expectedPlus20 = dateTimeUtils.totalMinutesToHoursAndMinutesParts(
      this.courseCompletion.expectedTimeMinutes * 1.2,
    )

    const courseMap: { [index: string]: string } = {
      'Course name': this.courseCompletion.courseName,
      'Course type': this.courseCompletion.courseType,
      Provider: this.courseCompletion.provider,
      'Expected time': dateTimeUtils.hoursAndMinutesToHumanReadable(+expected.hours, +expected.minutes),
      'Expected time with 20% allowance': dateTimeUtils.hoursAndMinutesToHumanReadable(
        +expectedPlus20.hours,
        Math.round(+expectedPlus20.minutes),
      ),
    }

    const maps = [learnerMap, courseMap]

    maps.forEach((map, i) => {
      Object.entries(map).forEach(([label, value]) => {
        summaryLists[i].getValueWithLabel(label).should('contain.text', value)
      })
    })

    const completionDate = dateTimeUtils.isoDateToUIDate(this.courseCompletion.completionDateTime)
    const timeSpent = dateTimeUtils.totalMinutesToHumanReadableHoursAndMinutes(this.courseCompletion.totalTimeMinutes)
    const status = CourseCompletionUtils.formattedCourseCompletionLabel(this.courseCompletion.status)

    this.completionDetails
      .getValueWithLabel(`Attempt ${this.courseCompletion.attempts}`)
      .should('contain.text', 'Pass')
      .should('contain.text', completionDate)
      .should('contain.text', timeSpent)
      .should('contain.text', status)
  }

  clickProcess() {
    cy.get('a').contains('Process').click()
  }
}
