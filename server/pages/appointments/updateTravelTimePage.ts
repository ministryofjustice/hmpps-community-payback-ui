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
  completeTaskPath?: string
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
    isTask = true,
  }: {
    appointment: AppointmentDto
    taskId: string
    contactOutcome?: ContactOutcomeDto
    project: ProjectDto
    originalSearch: SearchTravelTimePageInput
    req: Request
    isTask?: boolean
  }): PageViewData {
    const offender = new Offender(appointment.offender)

    const exitPath = this.exitPath(originalSearch, appointment, isTask)

    const appointmentLink = !isTask ? exitPath : ''

    return {
      heading: { title: offender.name, caption: offender.crn },
      backLink: exitPath,
      updatePath: this.updatePath(appointment, taskId, originalSearch, isTask),
      completeTaskPath:
        isTask &&
        pathWithQuery(paths.appointments.travelTime.complete(this.pathParams(appointment, taskId)), originalSearch),
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
      withAppointmentLink: !isTask,
      appointmentLink,
    }
  }

  exitPath(originalSearch: SearchTravelTimePageInput, appointment: AppointmentDto, isTask = true): string {
    if (isTask) {
      if (!originalSearch.provider) {
        return paths.appointments.travelTime.index({})
      }
      return pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch)
    }

    return pathWithQuery(
      paths.appointments.details({ projectCode: appointment.projectCode, appointmentId: appointment.id.toString() }),
      originalSearch,
    )
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

  updatePath(
    appointment: AppointmentDto,
    taskId: string,
    originalSearch: SearchTravelTimePageInput,
    isTask = true,
  ): string {
    if (isTask) {
      return pathWithQuery(paths.appointments.travelTime.update(this.pathParams(appointment, taskId)), originalSearch)
    }

    return pathWithQuery(
      paths.appointments.travelTime.create({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      originalSearch,
    )
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
