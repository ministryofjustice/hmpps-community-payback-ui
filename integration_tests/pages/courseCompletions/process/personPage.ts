import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class PersonPage extends BaseCourseCompletionsPage {
  constructor() {
    super('Check if this is the right person')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = paths.courseCompletions.process({ page: 'person', id: courseCompletion.id })
    cy.visit(path)

    return new PersonPage()
  }
}
