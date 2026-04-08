import { AppointmentDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import PageWithValidation from '../pageWithValidation'

interface PageViewData {
  backLink: string
  offender: Offender
  updatePath: string
  form?: string
}

export default class UpdateTravelTimePage extends PageWithValidation<ObjectWithHoursAndMinutes> {
  protected getValidationErrors(query: ObjectWithHoursAndMinutes): ValidationErrors<ObjectWithHoursAndMinutes> {
    return HoursAndMinutesInput.validationErrors(query, 'travel time')
  }

  viewData(appointment: AppointmentDto): PageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: paths.appointments.adjustTravelTime({}),
      updatePath: paths.appointments.travelTime.update({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
    }
  }
}
