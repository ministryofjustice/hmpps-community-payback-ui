import { ProjectOutcomeSummaryDto, ProviderTeamSummaryDto } from '../../../server/@types/shared'
import ErrorSummaryComponent from './errorSummaryComponent'
import SelectInput from './selectComponent'

export default class ProjectQuestionsComponent extends ErrorSummaryComponent {
  readonly teamInput = new SelectInput('team')

  readonly projectInput = new SelectInput('project')

  clearTeam() {
    this.teamInput.select('Choose team')
    cy.get('button').contains('Select team').click()
  }

  clearProject() {
    this.projectInput.select('Choose project')
  }

  selectTeam(team: ProviderTeamSummaryDto) {
    this.teamInput.select(team.code)
    cy.get('button').contains('Select team').click()
  }

  selectProject(project: ProjectOutcomeSummaryDto) {
    this.projectInput.select(project.projectCode)
  }

  shouldShowTeamError() {
    this.shouldShowErrorSummary('team', 'Choose a team')
  }

  shouldShowProjectError() {
    this.shouldShowErrorSummary('project', 'Choose a project')
  }
}
