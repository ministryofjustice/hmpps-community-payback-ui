import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'
import dateTimeUtils from '../../../server/utils/dateTimeUtils'
import { CourseCompletionPageInput } from '../../../server/pages/courseCompletionIndexPage'
import { pathWithQuery } from '../../../server/utils/utils'

export default class CourseCompletionPage extends Page {
  private courseCompletionDetails: SummaryListComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super(`${courseCompletion.firstName} ${courseCompletion.lastName}`)
    this.courseCompletionDetails = new SummaryListComponent()
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
    const { id, firstName, lastName, office, importedOn, resolved, pdu, ...rowsToCheck } = this.courseCompletion

    // turn `dateOfBirth` into `Date of birth`
    const labels = Object.keys(rowsToCheck).map(key => {
      if (key === 'completionDateTime') {
        return 'Completion date'
      }
      return key
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, s => s.toUpperCase())
    })
    const values = Object.entries(rowsToCheck).map(([key, value]) => {
      if (key === 'completionDateTime') {
        return dateTimeUtils.isoDateToUIDate(value as string)
      }
      return value
    })

    labels.forEach((label, i) => {
      this.courseCompletionDetails.getValueWithLabel(label).should('contain.text', values[i])
    })
  }

  clickProcess() {
    cy.get('a').contains('Process').click()
  }
}
