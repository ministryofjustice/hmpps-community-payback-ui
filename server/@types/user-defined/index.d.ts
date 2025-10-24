export interface AppointmentUpdatePageViewData {
  backLink: string
  offender: Offender
  updatePath: string
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
  contactOutcomeId?: string
  supervisorOfficerCode?: string
  notes?: string
  attendanceData?: AttendanceDataDto
  enforcementData?: EnforcementDto
}

export interface BaseRequest {
  username: string
}

export interface GetSessionsRequest extends BaseRequest {
  teamCode: string
  startDate: string
  endDate: string
}

export interface GetSessionRequest extends BaseRequest {
  projectCode: string
  date: string
  startTime: string
  endTime: string
}

export interface GetForTeamRequest extends BaseRequest {
  providerCode: string
  teamCode: string
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

export type GovUKTableRow = { text: string } | { html: string }

export type YesOrNo = 'yes' | 'no'

export type YesNoOrNotApplicable = YesOrNo | 'na'

export type ValidationErrors<T> = Partial<Record<keyof T, Record<'text', string>>>

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}
