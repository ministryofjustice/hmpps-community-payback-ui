import { ValidationErrors } from '../../@types/user-defined'
import PageWithValidation from '../pageWithValidation'
import config from '../../config'

export interface AppointmentTypePageBody {
  appointmentType?: 'INDUCTION' | 'GROUP' | 'INDIVIDUAL' | 'OTHER_ETE'
}

export default class AppointmentTypePage extends PageWithValidation<AppointmentTypePageBody> {
  protected getValidationErrors(query: AppointmentTypePageBody): ValidationErrors<AppointmentTypePageBody> {
    const allowedValues = ['INDUCTION', 'GROUP', 'INDIVIDUAL']

    if (config.featureFlags.otherEteEnabled) {
      allowedValues.push('OTHER_ETE')
    }

    if (!allowedValues.includes(query.appointmentType ?? '')) {
      return {
        appointmentType: {
          text: 'Select type of appointment',
        },
      }
    }

    return {}
  }
}
