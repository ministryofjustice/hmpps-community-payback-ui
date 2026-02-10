import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
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
import SessionUtils from '../../utils/sessionUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  supervisorItems: GovUkSelectOption[]
  project: { name: string; type: string; supervisingTeam: string; dateAndTime: string }
}

interface Body {
  supervisor: string
}

interface ProjectDetailsQuery extends AppointmentUpdateQuery {
  supervisor?: string
}

export default class CheckProjectDetailsPage extends BaseAppointmentUpdatePage {
  validationErrors: ValidationErrors<Body> = {}

  protected includeFormQueryInBackPath = false

  constructor(private readonly query: ProjectDetailsQuery) {
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

  viewData(appointment: AppointmentDto, supervisors: SupervisorSummaryDto[], form: AppointmentOutcomeForm): ViewData {
    const code = this.hasErrors ? this.query.supervisor : form.supervisor?.code

    return {
      ...this.commonViewData(appointment),
      supervisorItems: GovUkSelectInput.getOptions(supervisors, 'fullName', 'code', 'Choose supervisor', code),
      project: {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
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
    if (appointment.projectType.group === 'GROUP') {
      return SessionUtils.getSessionPath(appointment)
    }

    return paths.projects.show({ projectCode: appointment.projectCode })
  }

  protected nextPath(appointment: AppointmentDto): string {
    const { projectCode, id } = appointment
    return paths.appointments.attendanceOutcome({ projectCode, appointmentId: id.toString() })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.projectDetails({
      appointmentId: appointment.id.toString(),
      projectCode: appointment.projectCode,
    })
  }
}
