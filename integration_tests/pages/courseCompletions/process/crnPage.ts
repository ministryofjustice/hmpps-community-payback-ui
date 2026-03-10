import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class CrnPage extends BaseCourseCompletionsPage {
  constructor() {
    super()
  }

  protected override customCheckOnPage(): void {
    this.getTextInputById('crn').should('be.visible')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id })
    cy.visit(path)

    return new CrnPage()
  }

  enterCrn() {
    this.getTextInputById('crn').type('123')
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('crn', 'Enter a crn')
  }
}
