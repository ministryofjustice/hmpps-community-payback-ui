import { AppointmentDto, ProjectDto, ProviderSummaryDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  ValidationErrors,
} from '../../@types/user-defined'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import LocationUtils from '../../utils/locationUtils'
import { yesNoDisplayValue } from '../../utils/utils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  project: { name: string; type: string; supervisingTeam: string; dateAndTime: string; location: string }
  showContinueButton: boolean
  appointment: {
    providerCode: string
    notes: string
    pickUpTime: string
    pickUpPlace: string
    sensitive: string
    provider: string
    contactOutcomeCode?: string
  }
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

  viewData(
    appointment: AppointmentDto,
    project: ProjectDto,
    provider: ProviderSummaryDto,
    originalSearch: Record<string, string>,
  ): ViewData {
    return {
      ...this.commonViewData(appointment, originalSearch),
      appointment: {
        providerCode: appointment.providerCode,
        notes: appointment.notes,
        sensitive: yesNoDisplayValue(appointment.sensitive),
        pickUpTime: appointment.pickUpData?.time ? DateTimeFormats.stripTime(appointment.pickUpData.time) : '',
        pickUpPlace: appointment.pickUpData?.location
          ? LocationUtils.locationToString(appointment.pickUpData.location, { withLineBreaks: false })
          : '',
        provider: provider?.name,
      },
      project: {
        name: project.projectName,
        type: project.projectType.name,
        supervisingTeam: appointment.supervisingTeam,
        location: LocationUtils.locationToString(project.location, { withLineBreaks: false }),
        dateAndTime: DateTimeFormats.dateAndTimePeriod(appointment.date, appointment.startTime, appointment.endTime),
      },
      showContinueButton: !appointment.contactOutcomeCode,
    }
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
