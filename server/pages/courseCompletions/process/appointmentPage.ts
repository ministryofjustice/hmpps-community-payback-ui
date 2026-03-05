import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  appointmentId: number
}

export default class AppointmentPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'appointments'

  protected getValidationErrors(_: Body) {
    return {}
  }
}
