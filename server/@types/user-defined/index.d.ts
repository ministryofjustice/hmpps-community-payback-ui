import type { Response, RequestHandler } from 'express'
import {
  AppointmentDto,
  AttendanceDataDto,
  ContactOutcomeDto,
  SessionDto,
  SupervisorSummaryDto,
  ProjectTypeDto,
  ProviderTeamSummaryDto,
} from '../shared'
import ReferenceDataService from '../../services/referenceDataService'

export type AppointmentUpdatePageViewData = {
  selectedPeopleCard?: GovUkSummaryList
  heading: { title: string; caption: string; description?: string }
  backLink: string
  updatePath: string
  form?: string
}

export type AppointmentUpdateQuery = {
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
  startTime?: string
  /**
   * The end local time of the appointment
   */
  endTime?: string
  contactOutcome?: ContactOutcomeDto
  supervisor?: SupervisorSummaryDto
  team?: ProviderTeamSummaryDto
  attendanceData?: AttendanceDataDto
  enforcement?: EnforcementOutcomeForm
  originalSearch: Record<string, string>
  appointments?: Array<{ id: number; deliusVersion: string }>
} & BodyWithNotes

export interface AuditParams {
  action: string
  username: string
  details: Record<string, string>
  correlationId: string
  subjectType?: string
  subjectId?: string
}

export interface BaseRequest {
  username: string
}

export type PagedRequest = {
  page?: number
  size?: number
  sort?: Array<string>
}

export interface GetProjectsRequest extends BaseRequest, PagedRequest {
  providerCode: string
  teamCode: string
  projectTypeGroup: ProjectTypeDto['group']
  overdueDays?: number
}

export interface GetProjectsParams extends GetProjectsRequest {
  sortBy: ProjectsSortField | ProjectsSortField[]
  sortDirection: SortDirection
}

export interface GetSessionsRequest extends BaseRequest, PagedRequest {
  providerCode: string
  teamCode: string
  startDate: string
  endDate: string
}

export interface GetSessionsParams extends GetSessionsRequest {
  sortBy: SessionsSortField | SessionsSortField[]
  sortDirection: SortDirection
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

export type CourseCompletionResolutionStatus = 'Resolved' | 'Unresolved'

export type CourseCompletionShowCourseFailures = 'No' | 'Yes' | 'OnlyWhenMaxAttemptsReached'

export interface GetCourseCompletionsRequest extends BaseRequest, PagedRequest {
  providerCode: string
  pduId?: string
  dateFrom?: string
  dateTo?: string
  resolutionStatus?: CourseCompletionResolutionStatus
  showCourseFailures?: CourseCompletionShowCourseFailures
  externalReference?: string
}

export interface GetCourseCompletionsParams extends BaseRequest, PagedRequest, GetCourseCompletionsRequest {
  sortBy: CourseCompletionSortField | CourseCompletionSortField[]
  sortDirection: SortDirection
}

export interface GetCourseCompletionHistoryParams extends GetCourseCompletionRequest {
  blockSize?: number
}

export interface AppointmentRequest extends BaseRequest {
  appointmentId: string
  projectCode: string
}

export interface GetAppointmentTasksRequest extends BaseRequest, PagedRequest {
  providerCode: string
}

export interface GetAppointmentTasksParams extends BaseRequest, PagedRequest, GetAppointmentTasksRequest {
  sortBy: TravelTimeSortField | TravelTimeSortField[]
  sortDirection: SortDirection
}

export interface AppointmentParams {
  appointmentId: string
  projectCode: string
}

export interface AppointmentOrSessionParams {
  appointmentId?: string
  date?: string
  projectCode: string
}

export type AppointmentOrSession = AppointmentDto | SessionDto

export interface GovUkSelectOption {
  text: string
  value: string
  selected?: boolean
}

export interface GovUkRadioOrCheckboxOption {
  text: string
  value: string
  checked?: boolean
}

export interface LinkItem {
  text: string
  href: string
}

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow' | 'green' | 'teal'

export type GovUKValue = { text?: string; html?: string }
export type GovUkTitleValue = GovUKValue & { headingLevel?: number }

export type GovUKActionItem = { href: string; text: string; visuallyHiddenText: string }

export type GovUkSummaryList = {
  card?: {
    title: GovUkTitleValue
    actions?: {
      items: Array<GovUKActionItem>
    }
  }
  classes?: string
  rows: Array<GovUkSummaryListItem>
}

export type GovUkSummaryListItem = {
  key: GovUKValue
  value: GovUKValue
  actions?: { items: Array<GovUKActionItem> }
  classes?: string
}

export type StructuredDate = { year: string; month: string; day: string; formattedDate: string }

export type YesOrNo = 'yes' | 'no'

export type ValidationErrors<T> = Partial<Record<keyof T, Record<'text', string>>>

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]?: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type GetProvidersAndTeamsParams = {
  providerCode?: string
  teamCode?: string
  response: Response
  providerService: ProviderService
}

export type GetProvidersAndPdusParams = {
  providerCode?: string
  pduId?: string
  response: Response
  providerService: ProviderService
  referenceDataService: ReferenceDataService
}

export type SortDirection = 'asc' | 'desc'

export type TableCell = (TextItem | HtmlItem) & {
  attributes?: HtmlAttributes
  classes?: string
  format?: 'numeric'
  colspan?: number
  rowspan?: number
}

export type AriaSortDirection = 'none' | 'ascending' | 'descending'

export type CourseCompletionSortField = 'firstName' | 'lastName' | 'courseName' | 'completionDateTime' | 'status'

export type TravelTimeSortField = 'appointment.crn' | 'appointment.date'

export type SessionsSortField = 'date' | 'projectName' | 'allocatedCount' | 'outcomeCount'

export type ProjectsSortField = 'name' | 'overdueOutcomesCount' | 'oldestOverdueInDays'

export interface SummaryCard {
  title: string
  rows: Array<GovUkSummaryListItem>
}

export type ViewDataWithNotes = {
  notes?: string
  notesHint?: GovUKValue
  isSensitiveItems?: Array<GovUkRadioOrCheckboxOption>
}

export type ViewDataWithTimeToCredit = {
  timeToCredit: { hours: string; minutes: string }
}

export type BodyWithNotes = {
  notes?: string
  isSensitive?: YesOrNo
}

export interface IFormPageController {
  show(): RequestHandler
  submit(): RequestHandler
}

export type FormPageHandlerMethod = 'show' | 'submit'
