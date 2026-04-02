import { PagedModelAppointmentSummaryDto } from '../../../@types/shared'
import { ValidationErrors } from '../../../@types/user-defined'
import { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import BaseCourseCompletionFormPage from './baseCourseCompletionFormPage'
import { CourseCompletionPage } from './pathMap'

interface Body {
  appointmentId?: number
}

export default class AppointmentPage extends BaseCourseCompletionFormPage<Body> {
  protected page: CourseCompletionPage = 'appointments'

  getFormData(formData: CourseCompletionForm, body: Body): CourseCompletionForm {
    return { ...formData, appointmentIdToUpdate: Number(body.appointmentId) }
  }

  protected getValidationErrors(query: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!query.appointmentId) {
      errors.appointmentId = { text: 'Select an appointment or create a new one' }
    }

    return errors
  }

  getAppointmentOptions(appointments: PagedModelAppointmentSummaryDto, selectedOptionValue?: number) {
    return appointments.content.map(appointment => {
      const text = DateTimeFormats.isoDateToUIDate(appointment.date)
      const value = appointment.id

      const hintContent = [`Project type: ${appointment.projectTypeName}`, `Project: ${appointment.projectName}`]

      if (appointment.notes) {
        hintContent.push(`Notes: ${appointment.notes.split('\n').join('<br>')}`)
      }

      const hintHtml = hintContent.join('<br>')

      const checked = appointment.id === selectedOptionValue

      return { text, value, hint: { html: hintHtml }, checked }
    })
  }
}
