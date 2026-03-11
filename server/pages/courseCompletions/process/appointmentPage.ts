import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  appointmentId: number
}

export default class AppointmentPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'appointments'

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  protected getValidationErrors(_: Body) {
    return {}
  }
}
