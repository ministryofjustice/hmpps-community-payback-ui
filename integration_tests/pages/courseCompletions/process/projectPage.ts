import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import SelectInput from '../../components/selectComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class ProjectPage extends BaseCourseCompletionsPage {
  private readonly teamInput = new SelectInput('team')

  constructor() {
    super('Match with a project')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'project', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new ProjectPage()
  }

  shouldShowTeamInput() {
    this.teamInput.shouldNotHaveAValue()
  }
}
