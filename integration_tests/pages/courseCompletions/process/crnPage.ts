import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import { CourseCompletionPageInput } from '../../../../server/pages/courseCompletionIndexPage'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class CrnPage extends BaseCourseCompletionsPage {
  private readonly crnField = this.getTextInputById('crn')

  constructor() {
    super('Match with CRN')
  }

  static visit(
    courseCompletion: EteCourseCompletionEventDto,
    formId?: string,
    originalSearch: CourseCompletionPageInput = {},
  ) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id }), {
      ...originalSearch,
      form: formId,
    })
    cy.visit(path)

    return new CrnPage()
  }

  enterCrn() {
    this.crnField.type('123')
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('crn', 'Enter a CRN')
  }

  shouldHaveCrnValue(crn: string) {
    this.crnField.should('have.value', crn)
  }
}
