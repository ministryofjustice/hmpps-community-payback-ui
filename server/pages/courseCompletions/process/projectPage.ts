import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  team?: string
  project?: string
}

export default class ProjectPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'project'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return { ...formData, team: body.team, project: body.project }
  }

  protected getValidationErrors(body: Body): ValidationErrors<Body> {
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
