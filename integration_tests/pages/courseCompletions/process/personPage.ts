import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import LearnerDetailsComponent from '../learnerDetailsComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class PersonPage extends BaseCourseCompletionsPage {
  readonly courseCompletionRecord: LearnerDetailsComponent

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {
    super('Check if this is the right person')
    this.courseCompletionRecord = new LearnerDetailsComponent(this.courseCompletion)
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'person', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new PersonPage(courseCompletion)
  }
}
