import { AppointmentDto, ContactOutcomeDto, CreateAdjustmentDto, ProjectDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { pathWithQuery } from '../../utils/utils'
import PageWithValidation from '../pageWithValidation'
import { SearchTravelTimePageInput } from './searchTravelTimePage'

interface AppointmentDetails {
  date: string
  startTime: string
  endTime: string
  contactOutcome?: string
}

interface PageViewData {
  backLink: string
  offender: Offender
  updatePath: string
  completeTaskPath: string
  appointment: AppointmentDetails
  project: {
    name: string
    type: string
  }
}

export default class UpdateTravelTimePage extends PageWithValidation<ObjectWithHoursAndMinutes> {
  protected getValidationErrors(query: ObjectWithHoursAndMinutes): ValidationErrors<ObjectWithHoursAndMinutes> {
    return HoursAndMinutesInput.validationErrors(query, 'travel time')
  }

  viewData({
    appointment,
    taskId,
    contactOutcomes,
    project,
    originalSearch,
  }: {
    appointment: AppointmentDto
    taskId: string
    contactOutcomes: Array<ContactOutcomeDto>
    project: ProjectDto
    originalSearch: SearchTravelTimePageInput
  }): PageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.buildBackPath(originalSearch),
      updatePath: pathWithQuery(this.updatePath(appointment, taskId), originalSearch),
      completeTaskPath: paths.appointments.travelTime.complete(this.pathParams(appointment, taskId)),
      appointment: {
        date: DateTimeFormats.isoDateToUIDate(appointment.date),
        startTime: DateTimeFormats.stripTime(appointment.startTime),
        endTime: DateTimeFormats.stripTime(appointment.endTime),
        contactOutcome: this.selectedContactOutcomeName(appointment, contactOutcomes),
      },
      project: {
        name: project.projectName,
        type: project.projectType.name,
      },
    }
  }

  private buildBackPath(originalSearch: SearchTravelTimePageInput): string {
    if (Object.keys(originalSearch).length === 0) {
      return paths.appointments.travelTime.index({})
    }
    return pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch)
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

  private selectedContactOutcomeName(
    appointment: AppointmentDto,
    contactOutcomes: ContactOutcomeDto[],
  ): string | undefined {
    const selectedOutcome = contactOutcomes.find(outcome => outcome.code === appointment.contactOutcomeCode)

    return selectedOutcome?.name
  }
}
