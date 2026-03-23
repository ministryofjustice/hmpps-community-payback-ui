import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class OutcomePage extends BaseCourseCompletionsPage {
  constructor() {
    super('Record an outcome')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'outcome', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new OutcomePage()
  }

  enterCreditedHours() {
    this.getTextInputByIdAndEnterDetails('hours', '1')
    this.getTextInputByIdAndEnterDetails('minutes', '30')
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('hours', 'Enter hours and minutes for credited hours')
  }
}
