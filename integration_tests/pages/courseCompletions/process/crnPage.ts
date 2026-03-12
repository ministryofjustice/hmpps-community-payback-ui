import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class CrnPage extends BaseCourseCompletionsPage {
  private readonly crnField = this.getTextInputById('crn')

  constructor() {
    super('Match with CRN')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id })
    cy.visit(path)

    return new CrnPage()
  }

  enterCrn() {
    this.crnField.type('123')
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('crn', 'Enter a crn')
  }

  shouldHaveCrnValue(crn: string) {
    this.crnField.should('have.value', crn)
  }
}
