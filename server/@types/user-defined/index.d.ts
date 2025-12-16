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
   * The start local time of the appointment
   */
  startTime?: string
  /**
   * The end local time of the appointment
   */
  endTime?: string
  contactOutcome?: ContactOutcomeDto
  supervisor?: SupervisorSummaryDto
  notes?: string
  attendanceData?: AttendanceDataDto
  enforcement?: EnforcementOutcomeForm
}

export interface BaseRequest {
  username: string
}

export interface GetSessionsRequest extends BaseRequest {
  providerCode: string
  teamCode: string
  startDate: string
  endDate: string
}

export interface GetSessionRequest extends BaseRequest {
  projectCode: string
  date: string
}

export interface GetForTeamRequest extends BaseRequest {
  providerCode: string
  teamCode: string
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

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow'

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
