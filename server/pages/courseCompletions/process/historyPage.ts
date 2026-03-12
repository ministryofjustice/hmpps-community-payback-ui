import { AppointmentSummaryDto } from '../../../@types/shared'
import { AppointmentCard } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import AppointmentUtils from '../../../utils/appointmentUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  canCreditHours: boolean
}

interface ViewData {
  appointmentCards: Array<AppointmentCard>
}

export default class HistoryPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'history'

  getFormData(formData: CourseCompletionForm, _body: Body): CourseCompletionForm {
    // TODO: implement form data to save
    return formData
  }

  protected getValidationErrors(_: Body) {
    return {}
  }

  stepViewData(appointments: Array<AppointmentSummaryDto>): ViewData {
    return {
      appointmentCards: appointments.map(AppointmentUtils.appointmentCard),
    }
  }
}
