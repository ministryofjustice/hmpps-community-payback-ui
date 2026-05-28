import type { Request } from 'express'
import {
  AppointmentDto,
  ContactOutcomeDto,
  CreateAdjustmentDto,
  ProjectDto,
  UnpaidWorkDetailsDto,
} from '../../@types/shared'
import { ValidationErrors } from '../../@types/user-defined'
import HoursAndMinutesInput, { ObjectWithHoursAndMinutes } from '../../forms/hoursAndMinutesInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { pathWithQuery } from '../../utils/utils'
import PageWithValidation from '../pageWithValidation'
import { SearchTravelTimePageInput } from './searchTravelTimePage'
import GovukFrontendDateInput, { GovUkFrontendDateInputItem } from '../../forms/GovukFrontendDateInput'

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
  dateItems: Array<GovUkFrontendDateInputItem>
}

type TimePeriods = 'day' | 'month' | 'year'
type DateKeys = `date-${TimePeriods}`

type DateBody = {
  [K in DateKeys]?: string
}

type ObjectWithDateTimeAndMinutes = DateBody & ObjectWithHoursAndMinutes

export default class UpdateTravelTimePage extends PageWithValidation<ObjectWithDateTimeAndMinutes> {
  protected getValidationErrors(
    query: ObjectWithDateTimeAndMinutes,
    additionalParams: UnpaidWorkDetailsDto,
  ): ValidationErrors<ObjectWithHoursAndMinutes> {
    return {
      ...HoursAndMinutesInput.validationErrors(query, 'travel time'),
      ...this.getDateErrors(query, additionalParams),
    }
  }

  viewData({
    appointment,
    taskId,
    contactOutcome,
    project,
    originalSearch,
    req,
    upwDetails,
  }: {
    appointment: AppointmentDto
    taskId: string
    contactOutcome?: ContactOutcomeDto
    project: ProjectDto
    originalSearch: SearchTravelTimePageInput
    req: Request
    upwDetails: UnpaidWorkDetailsDto
  }): PageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.exitPath(originalSearch),
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
      dateItems: this.getDateItems(req, upwDetails),
    }
  }

  getDateItems(req: Request, upwDetails: UnpaidWorkDetailsDto): Array<GovUkFrontendDateInputItem> {
    const date = {
      day: req.body?.['date-day'] ?? '',
      month: req.body?.['date-month'] ?? '',
      year: req.body?.['date-year'] ?? '',
    }
    const hasDateError =
      (this.getDateErrors(req.body, upwDetails) as ValidationErrors<DateBody>)['date-day'] !== undefined
    return GovukFrontendDateInput.getDateItemsFromStructuredDate(date, hasDateError)
  }

  getDateErrors(body: DateBody, upwDetails: UnpaidWorkDetailsDto) {
    if (!body) {
      return {}
    }

    if (!GovukFrontendDateInput.dateIsComplete(body, 'date')) {
      return { 'date-day': { text: 'Enter a day, month and year for this adjustment' } }
    }

    if (!GovukFrontendDateInput.dateIsValid(body, 'date')) {
      return { 'date-day': { text: 'Adjustment must have a valid date' } }
    }

    if (GovukFrontendDateInput.dateIsInTheFuture(body, 'date')) {
      return { 'date-day': { text: 'Adjustment date must not be in the future' } }
    }

    if (upwDetails && !GovukFrontendDateInput.dateIsOnOrAfterDate(body, 'date', upwDetails.sentenceDate)) {
      return { 'date-day': { text: 'Adjustment date must not be earlier than the sentence date' } }
    }

    return {}
  }

  exitPath(originalSearch: SearchTravelTimePageInput): string {
    if (!originalSearch.provider) {
      return paths.appointments.travelTime.index({})
    }
    return pathWithQuery(paths.appointments.travelTime.filter({}), originalSearch)
  }

  requestBody(
    body: ObjectWithDateTimeAndMinutes,
    taskId: string,
  ): Pick<CreateAdjustmentDto, 'taskId' | 'minutes' | 'adjustmentDate'> {
    return {
      taskId,
      minutes: DateTimeFormats.hoursAndMinutesToMinutes(body.hours, body.minutes),
      adjustmentDate: DateTimeFormats.dateAndTimeInputsToIsoString(body, 'date').date,
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
