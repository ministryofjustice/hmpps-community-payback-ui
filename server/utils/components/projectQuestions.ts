import { ValidationErrors } from '../../@types/user-defined'

export interface ProjectQuestionsBody {
  team?: string
  project?: string
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
}
