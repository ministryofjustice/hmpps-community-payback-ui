import { AppointmentDto, ContactOutcomeDto, ProjectDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSummaryListItem,
  ValidationErrors,
} from '../../@types/user-defined'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import GovUKComponentUtils from '../../utils/govUkComponentUtils'
import HtmlUtils from '../../utils/htmlUtils'
import LocationUtils from '../../utils/locationUtils'
import { yesNoDisplayValue } from '../../utils/utils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  projectItems: Array<GovUkSummaryListItem>
  showContinueButton: boolean
  showMissingOutcomeMessage: boolean
  appointmentItems: Array<GovUkSummaryListItem>
  complianceItems: Array<GovUkSummaryListItem>
  timeItems: Array<GovUkSummaryListItem>
  sharedItems: Array<GovUkSummaryListItem>
  contactOutcome?: {
    name: string
    tagClass: string
  }
  nextPath: string
}

export default class CheckAppointmentDetailsPage extends BaseAppointmentUpdatePage<AppointmentUpdateQuery> {
  protected getValidationErrors(
    _query: AppointmentUpdateQuery,
    _additionalParams?: unknown,
  ): ValidationErrors<AppointmentUpdateQuery> {
    throw new Error('Method not implemented.')
  }

  protected page: AppointmentFormPage = 'appointment-details'

  protected getForm(data: AppointmentOutcomeForm, supervisors: SupervisorSummaryDto[]): AppointmentOutcomeForm {
    return {
      ...data,
      supervisor: undefined,
    }
  }

  viewData({
    appointment,
    project,
    originalSearch,
    contactOutcome,
    formId,
  }: {
    appointment: AppointmentDto
    project: ProjectDto
    originalSearch: Record<string, string>
    contactOutcome?: ContactOutcomeDto
    formId?: string
  }): ViewData {
    return {
      ...this.commonViewData({
        appointmentOrSession: appointment,
        originalSearch,
        project,
        form: {} as AppointmentOutcomeForm,
        formId,
      }),
      projectItems: this.buildProjectDetails(project, appointment),
      appointmentItems: this.buildAppointmentDetails(appointment),
      showContinueButton: !appointment.contactOutcomeCode,
      complianceItems: this.buildComplianceDetails(appointment),
      timeItems: this.buildTimeDetails(appointment),
      sharedItems: this.buildSharedDetails(appointment),
      contactOutcome: this.buildContactOutcomeDetails(contactOutcome),
      showMissingOutcomeMessage: this.isMissingOutcome(appointment),
      nextPath: this.next({ projectCode: appointment.projectCode, appointmentId: appointment.id.toString(), formId }),
    }
  }

  private isMissingOutcome(appointment: AppointmentDto): boolean {
    if (appointment.contactOutcomeCode) {
      return false
    }

    if (DateTimeFormats.dateTimeIsInFuture(appointment.date, appointment.startTime)) {
      return false
    }

    return true
  }

  buildContactOutcomeDetails(contactOutcome?: ContactOutcomeDto): { name: string; tagClass: string } | undefined {
    if (!contactOutcome) {
      return undefined
    }

    return {
      name: contactOutcome.name,
      tagClass: HtmlUtils.getStatusTagClass(AppointmentUtils.getStatusColour(contactOutcome)),
    }
  }

  private buildAppointmentDetails(appointment: AppointmentDto): Array<GovUkSummaryListItem> {
    return GovUKComponentUtils.buildSummaryListItems(
      [
        { label: 'Notes detail', content: AppointmentUtils.formatNotesAsHtml(appointment.notes), contentIsHtml: true },
        { label: 'Sensitive', content: yesNoDisplayValue(appointment.sensitive) },
      ],
      true,
    )
  }

  private buildSharedDetails(appointment: AppointmentDto): Array<GovUkSummaryListItem> {
    return GovUKComponentUtils.buildSummaryListItems(
      [
        { label: 'Enforcement action', content: appointment.enforcementData?.enforcementActionName },
        {
          label: 'Respond by',
          content: appointment.enforcementData?.respondBy
            ? DateTimeFormats.isoDateToUIDate(appointment.enforcementData.respondBy)
            : undefined,
        },
        { label: 'Alert sent', content: yesNoDisplayValue(appointment.alertActive) },
      ],
      true,
    )
  }

  private buildTimeDetails(appointment: AppointmentDto): GovUkSummaryListItem[] {
    const penaltyMinutes = appointment.attendanceData?.penaltyMinutes ?? 0
    const minutesCredited = appointment.minutesCredited ?? 0
    const minutesWorked = minutesCredited + penaltyMinutes
    return GovUKComponentUtils.buildSummaryListItems(
      [
        {
          label: 'Hours worked',
          content:
            minutesWorked > 0 ? DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutesWorked) : undefined,
        },
        {
          label: 'Penalty hours',
          content:
            penaltyMinutes > 0 ? DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(penaltyMinutes) : undefined,
        },
        {
          label: 'Hours credited',
          content:
            minutesCredited > 0
              ? DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutesCredited)
              : undefined,
        },
      ],
      true,
    )
  }

  private buildComplianceDetails(appointment: AppointmentDto): Array<GovUkSummaryListItem> {
    if (appointment.attendanceData) {
      return GovUKComponentUtils.buildSummaryListItems(
        [
          { label: 'Wore hi-vis', content: yesNoDisplayValue(appointment.attendanceData?.hiVisWorn) },
          { label: 'Working intensively', content: yesNoDisplayValue(appointment.attendanceData?.workedIntensively) },
          {
            label: 'Work quality',
            content: AppointmentUtils.formatComplianceRatings(appointment.attendanceData?.workQuality),
          },
          {
            label: 'Behaviour',
            content: AppointmentUtils.formatComplianceRatings(appointment.attendanceData?.behaviour),
          },
        ],
        true,
      )
    }

    return []
  }

  private buildProjectDetails(project: ProjectDto, appointment: AppointmentDto): Array<GovUkSummaryListItem> {
    const items = [
      { label: 'Region', content: project.providerName },
      { label: 'Team', content: project.teamName },
      { label: 'Project', content: project.projectName },
      { label: 'Project type', content: project.projectType.name },
      { label: 'Location', content: LocationUtils.locationToString(project.location, { withLineBreaks: false }) },
      { label: 'Date', content: DateTimeFormats.isoDateToUIDate(appointment.date) },
      {
        label: 'Time',
        content: `${DateTimeFormats.stripTime(appointment.startTime)} - ${DateTimeFormats.stripTime(appointment.endTime)}`,
      },
      {
        label: 'Pick up place',
        content: appointment.pickUpData?.pickupLocation
          ? LocationUtils.locationToString(appointment.pickUpData?.pickupLocation, { withLineBreaks: false })
          : undefined,
      },
      {
        label: 'Pick up time',
        content: appointment.pickUpData?.time ? DateTimeFormats.stripTime(appointment.pickUpData?.time) : undefined,
      },
      { label: 'Supervising team', content: appointment.supervisingTeam },
      { label: 'Supervising officer', content: appointment.supervisorOfficerName },
    ]

    return GovUKComponentUtils.buildSummaryListItems(items, true)
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage | undefined {
    return undefined
  }

  protected nextPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }
}
