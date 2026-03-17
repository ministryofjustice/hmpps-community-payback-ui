import {
  EteCourseCompletionEventDto,
  ProjectOutcomeSummaryDto,
  ProviderTeamSummaryDto,
} from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import SelectInput from '../../components/selectComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class ProjectPage extends BaseCourseCompletionsPage {
  private readonly teamInput = new SelectInput('team')

  private readonly projectInput = new SelectInput('project')

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

  selectTeam(team: ProviderTeamSummaryDto) {
    this.teamInput.select(team.code)
    cy.get('button').contains('Select team').click()
  }

  selectProject(project: ProjectOutcomeSummaryDto) {
    this.projectInput.select(project.projectCode)
  }
}
