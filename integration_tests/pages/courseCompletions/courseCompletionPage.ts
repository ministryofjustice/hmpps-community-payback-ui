import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class CourseCompletionPage extends Page {
  private courseCompletionDetails: SummaryListComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super(`${courseCompletion.firstName} ${courseCompletion.lastName}`)
    this.courseCompletionDetails = new SummaryListComponent()
  }

  static visit(courseCompletion: EteCourseCompletionEventDto): CourseCompletionPage {
    const path = `${paths.courseCompletions.show({ id: courseCompletion.id })}`
    cy.visit(path)

    return new CourseCompletionPage(courseCompletion)
  }

  shouldShowCourseCompletionDetails() {
    const { id, firstName, lastName, ...rowsToCheck } = this.courseCompletion

    // turn `dateOfBirth` into `Date of birth`
    const labels = Object.keys(rowsToCheck).map(key => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, s => s.toUpperCase())
    })
    const values = Object.values(rowsToCheck)

    labels.forEach((label, i) => {
      this.courseCompletionDetails.getValueWithLabel(label).should('contain.text', values[i])
    })
  }
}
