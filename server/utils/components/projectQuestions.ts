import { ProjectsAndTeamsViewData } from '../../controllers/shared/getProjectsAndTeams'
import { ValidationErrors } from '../../@types/user-defined'
import { ProviderSummaryDto } from '../../@types/shared'

export interface ProjectQuestionsBody {
  team?: string
  project?: string
}

type ProjectQuestionsForm = {
  projectTeam?: ProviderSummaryDto
  project?: ProviderSummaryDto
}

export default class ProjectQuestions {
  static getValidationErrors(body: ProjectQuestionsBody): ValidationErrors<ProjectQuestionsBody> {
    // Team is required before selecting a project, so return one error at a time
    if (!body.team) {
      return { team: { text: 'Choose a team' } }
    }

    if (!body.project) {
      return { project: { text: 'Choose a project' } }
    }

    return {}
  }

  static updateFormData<T extends ProjectQuestionsForm>(
    form: T,
    query: ProjectQuestionsBody,
    { teamItems, projectItems }: ProjectsAndTeamsViewData,
  ): T {
    const selectedTeam = teamItems.find(team => team.value === query.team)
    const selectedProject = projectItems.find(project => project.value === query.project)

    if (!selectedTeam) {
      throw new Error(`Selected team with code ${query.team} was not found.`)
    }

    if (!selectedProject) {
      throw new Error(`Selected project with code ${query.project} was not found.`)
    }

    return {
      ...form,
      projectTeam: { code: selectedTeam.value, name: selectedTeam.text },
      project: { code: selectedProject.value, name: selectedProject.text },
    }
  }
}
