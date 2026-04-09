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
  completeTaskPath: string
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
      completeTaskPath: paths.appointments.travelTime.complete(this.pathParams(appointment, taskId)),
    }
  }

  requestBody(body: ObjectWithHoursAndMinutes, taskId: string): Pick<CreateAdjustmentDto, 'taskId' | 'minutes'> {
    return {
      taskId,
      minutes: DateTimeFormats.hoursAndMinutesToMinutes(body.hours, body.minutes),
    }
  }

  updatePath(appointment: AppointmentDto, taskId: string): string {
    return paths.appointments.travelTime.update(this.pathParams(appointment, taskId))
  }

  private pathParams(
    appointment: AppointmentDto,
    taskId: string,
  ): { projectCode: string; appointmentId: string; taskId: string } {
    return {
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
      taskId,
    }
  }

  successMessage(appointment: AppointmentDto, minutes?: number) {
    const offender = new Offender(appointment.offender)
    const formattedDate = DateTimeFormats.isoDateToUIDate(appointment.date)
    const dateDetail = `on ${formattedDate}`
    const actionDescription = minutes
      ? `has been adjusted for ${DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutes)} of travel time.`
      : `has been recorded as not eligible for travel time.`

    if (offender.isLimited) {
      return `The appointment for CRN: ${offender.crn} ${dateDetail} ${actionDescription}`
    }

    return `${offender.name}'s appointment ${dateDetail} ${actionDescription}`
  }
}
