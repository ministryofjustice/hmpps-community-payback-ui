import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import ProjectQuestions, { ProjectQuestionsBody } from '../../../utils/components/projectQuestions'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

export default class ProjectPage extends BaseCourseCompletionFormPage<ProjectQuestionsBody> {
  protected page: CourseCompletionPage = 'project'

  protected getValidationErrors(body: ProjectQuestionsBody): ValidationErrors<ProjectQuestionsBody> {
    return ProjectQuestions.getValidationErrors(body)
  }

  getFormData(formData: CourseCompletionForm, body: ProjectQuestionsBody): CourseCompletionForm {
    return { ...formData, team: body.team, project: body.project }
  }
}
