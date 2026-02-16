import { AppointmentDto, ProjectDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import LocationUtils from '../../utils/locationUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  supervisorItems: GovUkSelectOption[]
  project: { name: string; type: string; supervisingTeam: string; dateAndTime: string; location: string }
  appointment: { providerCode: string; notes: string; pickUpTime: string; pickUpPlace: string }
}

interface Body {
  supervisor: string
}

interface ProjectDetailsQuery extends AppointmentUpdateQuery {
  supervisor?: string
}

export default class CheckProjectDetailsPage extends BaseAppointmentUpdatePage {
  validationErrors: ValidationErrors<Body> = {}

  constructor(
    private readonly query: ProjectDetailsQuery,
    private readonly project: ProjectDto,
  ) {
    super(query)
  }

  get hasErrors() {
    return Object.keys(this.validationErrors).length > 0
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
    supervisors: SupervisorSummaryDto[],
    form: AppointmentOutcomeForm,
    project: ProjectDto,
  ): ViewData {
    const code = this.hasErrors ? this.query.supervisor : form.supervisor?.code

    return {
      ...this.commonViewData(appointment),
      appointment: {
        providerCode: appointment.providerCode,
        notes: appointment.notes,
        pickUpTime: appointment.pickUpData?.time ? DateTimeFormats.stripTime(appointment.pickUpData.time) : '',
        pickUpPlace: appointment.pickUpData?.location
          ? LocationUtils.locationToString(appointment.pickUpData.location, { withLineBreaks: false })
          : '',
      },
      supervisorItems: GovUkSelectInput.getOptions(supervisors, 'fullName', 'code', 'Choose supervisor', code),
      project: {
        name: project.projectName,
        type: project.projectType.name,
        supervisingTeam: appointment.supervisingTeam,
        location: LocationUtils.locationToString(project.location, { withLineBreaks: false }),
        dateAndTime: DateTimeFormats.dateAndTimePeriod(appointment.date, appointment.startTime, appointment.endTime),
      },
    }
  }

  validate() {
    if (!this.query.supervisor) {
      this.validationErrors.supervisor = { text: 'Select a supervisor' }
    }
  }

  protected backPath(appointment: AppointmentDto): string {
    return this.exitForm(appointment, this.project)
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    return paths.appointments.attendanceOutcome({ projectCode, appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.projectDetails({
      appointmentId: appointment.id.toString(),
      projectCode: appointment.projectCode,
    })
  }
}
