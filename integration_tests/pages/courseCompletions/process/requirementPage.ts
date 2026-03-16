import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import LearnerDetailsComponent from '../learnerDetailsComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class RequirementPage extends BaseCourseCompletionsPage {
  readonly courseCompletionRecord: LearnerDetailsComponent

  constructor() {
    super('Select a requirement')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'requirement', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new RequirementPage()
  }
}
