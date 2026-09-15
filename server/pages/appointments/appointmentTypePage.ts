import { ValidationErrors } from '../../@types/user-defined'
import PageWithValidation from '../pageWithValidation'

export interface AppointmentTypePageBody {
  appointmentType?: 'INDUCTION' | 'GROUP' | 'INDIVIDUAL'
}

export default class AppointmentTypePage extends PageWithValidation<AppointmentTypePageBody> {
  protected getValidationErrors(query: AppointmentTypePageBody): ValidationErrors<AppointmentTypePageBody> {
    if (!query.appointmentType) {
      return {
        appointmentType: {
          text: 'Select an appointment type',
        },
      }
    }

    return {}
  }
}
