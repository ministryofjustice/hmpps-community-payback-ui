import { AppointmentDto, ProjectDto, ProviderSummaryDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSummaryListItem,
  ValidationErrors,
} from '../../@types/user-defined'
import paths from '../../paths'
import AppointmentUtils from '../../utils/appointmentUtils'
import DateTimeFormats from '../../utils/dateTimeUtils'
import GovUKComponentUtils from '../../utils/govUkComponentUtils'
import LocationUtils from '../../utils/locationUtils'
import { yesNoDisplayValue } from '../../utils/utils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  projectItems: Array<GovUkSummaryListItem>
  showContinueButton: boolean
  appointment: {
    notes: string
    sensitive: string
    contactOutcomeCode?: string
  }
  complianceItems: Array<GovUkSummaryListItem>
}

interface Body {
  supervisor: string
}

interface AppointmentDetailsQuery extends AppointmentUpdateQuery {
  supervisor?: string
}

export default class CheckAppointmentDetailsPage extends BaseAppointmentUpdatePage {
  validationErrors: ValidationErrors<Body> = {}

  constructor(
    private readonly query: AppointmentDetailsQuery,
    private readonly project?: ProjectDto,
  ) {
    super(query)
  }

  protected getForm(data: AppointmentOutcomeForm, supervisors: SupervisorSummaryDto[]): AppointmentOutcomeForm {
    const selectedSupervisor = supervisors.find(supervisor => supervisor.code === this.query.supervisor)
    return {
      ...data,
      supervisor: selectedSupervisor,
    }
  }

  setFormId(id: string) {
    this.formId = id
  }

  viewData({
    appointment,
    project,
    provider,
    originalSearch,
  }: {
    appointment: AppointmentDto
    project: ProjectDto
    provider: ProviderSummaryDto
    originalSearch: Record<string, string>
  }): ViewData {
    return {
      ...this.commonViewData(appointment, originalSearch),
      appointment: {
        notes: appointment.notes,
        sensitive: yesNoDisplayValue(appointment.sensitive),
      },
      projectItems: this.buildProjectDetails(project, appointment, provider),
      showContinueButton: !appointment.contactOutcomeCode,
      complianceItems: this.buildComplianceDetails(appointment),
    }
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

  private buildProjectDetails(
    project: ProjectDto,
    appointment: AppointmentDto,
    provider: ProviderSummaryDto,
  ): Array<GovUkSummaryListItem> {
    const items = [
      { label: 'Region', content: provider?.name },
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
      { label: 'Pick up time', content: DateTimeFormats.stripTime(appointment.pickUpData?.time) },
      { label: 'Supervising team', content: appointment.supervisingTeam },
      { label: 'Supervising officer', content: appointment.supervisorOfficerName },
    ]

    return GovUKComponentUtils.buildSummaryListItems(items, true)
  }

  protected backPath(appointment: AppointmentDto, originalSearch: Record<string, string>): string {
    return this.exitForm(appointment, this.project, originalSearch)
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    return this.pathWithFormId(paths.appointments.chooseSupervisor({ projectCode, appointmentId }))
  }

  updatePath(appointment: AppointmentDto): string {
    return this.pathWithFormId(
      paths.appointments.appointmentDetails({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
      }),
    )
  }
}
