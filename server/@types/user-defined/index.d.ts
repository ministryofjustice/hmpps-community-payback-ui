import type { Response } from 'express'
import { AttendanceDataDto, ContactOutcomeDto, SupervisorSummaryDto } from '../shared'

export interface AppointmentUpdatePageViewData {
  backLink: string
  offender: Offender
  updatePath: string
  form?: string
}

export interface AppointmentUpdateQuery {
  form?: string
}

export type AppointmentOutcomeForm = {
  /**
   * The appointment version from Delius
   */
  deliusVersion?: string
  /**
   * The start local time of the appointment
   */
  startTime: string
  /**
   * The end local time of the appointment
   */
  endTime: string
  contactOutcome?: ContactOutcomeDto
  supervisor?: SupervisorSummaryDto
  notes?: string
  attendanceData?: AttendanceDataDto
  enforcement?: EnforcementOutcomeForm
  sensitive?: boolean
}

export interface BaseRequest {
  username: string
}

export type PagedRequest = {
  page?: number
  size?: number
  sort?: Array<string>
}

export interface GetProjectsRequest extends BaseRequest {
  providerCode: string
  teamCode: string
  projectTypeGroup: ProjectTypeGroup
}

export interface GetSessionsRequest extends BaseRequest {
  providerCode: string
  teamCode: string
  startDate: string
  endDate: string
}

export interface GetProjectRequest extends BaseRequest {
  projectCode: string
}

export interface GetSessionRequest extends GetProjectRequest {
  date: string
}

export interface GetForTeamRequest extends BaseRequest {
  providerCode: string
  teamCode: string
}

export interface GetCourseCompletionRequest extends BaseRequest {
  id: string
}

export interface GetCourseCompletionsRequest extends BaseRequest, PagedRequest {
  providerCode: string
  dateFrom?: string
  dateTo?: string
}

export interface AppointmentRequest extends BaseRequest {
  appointmentId: string
  projectCode: string
}

export interface AppointmentParams {
  appointmentId: string
  projectCode: string
}

export interface GovUkSelectOption {
  text: string
  value: string
  selected?: boolean
}

export interface GovUkRadioOption {
  text: string
  value: string
  checked?: boolean
}

export interface LinkItem {
  text: string
  href: string
}

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow' | 'green'

export type GovUKValue = { text: string } | { html: string }

export type GovUkSummaryListItem = { key: GovUKValue; value: GovUKValue }

export type StructuredDate = { year: string; month: string; day: string; formattedDate: string }

export type YesOrNo = 'yes' | 'no'

export type ValidationErrors<T> = Partial<Record<keyof T, Record<'text', string>>>

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type ProjectTypeGroup = 'GROUP' | 'INDIVIDUAL'

export type GetProvidersAndTeamsParams = {
  providerCode?: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}
