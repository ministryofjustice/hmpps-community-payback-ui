import { AppointmentDto, CreateAdjustmentDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
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

  viewData(appointment: AppointmentDto, taskId: string): PageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: paths.appointments.travelTime.index({}),
      updatePath: this.updatePath(appointment, taskId),
    }
  }

  requestBody(body: ObjectWithHoursAndMinutes, taskId: string): Pick<CreateAdjustmentDto, 'taskId' | 'minutes'> {
    return {
      taskId,
      minutes: DateTimeFormats.hoursAndMinutesToMinutes(body.hours, body.minutes),
    }
  }

  updatePath(appointment: AppointmentDto, taskId: string): string {
    return paths.appointments.travelTime.update({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
      taskId,
    })
  }
}
