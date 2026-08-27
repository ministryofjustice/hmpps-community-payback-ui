import type { Request } from 'express'
import { AppointmentDto, ContactOutcomeDto, CreateAdjustmentDto, ProjectDto } from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
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
  heading: { title: string; caption: string }
  updatePath: string
  completeTaskPath: string
  appointment: AppointmentDetails
  project: {
    name: string
    type: string
  }
  withAppointmentLink: boolean
  appointmentLink: string
}

type ObjectWithTime = {
  time: number
}

export default class UpdateTravelTimePage extends PageWithValidation<ObjectWithTime> {
  protected getValidationErrors(query: ObjectWithTime): ValidationErrors<ObjectWithTime> {
    const validationErrors = {} as ValidationErrors<ObjectWithTime>

    if (!query.time) {
      validationErrors.time = { text: 'Select an amount of travel time' }
    }

    return validationErrors
  }

  viewData({
    appointment,
    taskId,
    contactOutcome,
    project,
    originalSearch,
    withAppointmentLink = false,
  }: {
    appointment: AppointmentDto
    taskId: string
    contactOutcome?: ContactOutcomeDto
    project: ProjectDto
    originalSearch: SearchTravelTimePageInput
    req: Request
    withAppointmentLink?: boolean
  }): PageViewData {
    const offender = new Offender(appointment.offender)

    const appointmentLink = withAppointmentLink
      ? paths.appointments.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: 'appointment-details',
        })
      : ''

    return {
      heading: { title: offender.name, caption: offender.crn },
      backLink: withAppointmentLink ? appointmentLink : this.exitPath(originalSearch),
      updatePath: this.updatePath(appointment, taskId, originalSearch),
      completeTaskPath: pathWithQuery(
        paths.appointments.travelTime.complete(this.pathParams(appointment, taskId)),
        originalSearch,
      ),
      appointment: {
        date: DateTimeFormats.isoDateToUIDate(appointment.date),
        startTime: DateTimeFormats.stripTime(appointment.startTime),
        endTime: DateTimeFormats.stripTime(appointment.endTime),
        contactOutcome: contactOutcome?.name,
      },
      project: {
        name: project.projectName,
        type: project.projectType.name,
      },
      withAppointmentLink,
      appointmentLink,
    }
  }

  exitPath(originalSearch: SearchTravelTimePageInput): string {
    if (!originalSearch.provider) {
      return paths.appointments.travelTime.index({})
    }
    return pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch)
  }

  requestBody(
    body: ObjectWithTime,
    appointment: AppointmentDto,
  ): Pick<CreateAdjustmentDto, 'appointmentId' | 'minutes' | 'adjustmentDate'> {
    return {
      appointmentId: appointment.communityPaybackId,
      minutes: body.time,
      adjustmentDate: appointment.date,
    }
  }

  updatePath(appointment: AppointmentDto, taskId: string, originalSearch: SearchTravelTimePageInput): string {
    return pathWithQuery(paths.appointments.travelTime.update(this.pathParams(appointment, taskId)), originalSearch)
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
