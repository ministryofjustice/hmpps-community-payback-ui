import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  teamCode: string
  projectCode: string
}

export default class ProjectPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'project'

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  protected getValidationErrors(_: Body) {
    return {}
  }
}
