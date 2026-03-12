import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class OutcomePage extends BaseCourseCompletionsPage {
  constructor() {
    super('Record an outcome')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = paths.courseCompletions.process({ page: 'outcome', id: courseCompletion.id })
    cy.visit(path)

    return new OutcomePage()
  }
}
