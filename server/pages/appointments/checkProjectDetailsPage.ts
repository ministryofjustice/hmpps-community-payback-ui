import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import {
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
  hasErrors: boolean

  validationErrors: ValidationErrors<Body> = {}

  constructor(private readonly query: ProjectDetailsQuery) {
    super(query)
  }

  viewData(appointment: AppointmentDto, supervisors: SupervisorSummaryDto[]): ViewData {
    return {
      ...this.commonViewData(appointment),
      supervisorItems: GovUkSelectInput.getOptions(
        supervisors,
        'name',
        'code',
        'Choose supervisor',
        appointment.supervisorOfficerCode,
      ),
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

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  protected backPath(appointment: AppointmentDto): string {
    return SessionUtils.getSessionPath(appointment)
  }

  protected nextPath(appointmentId: string): string {
    return paths.appointments.attendanceOutcome({ appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.projectDetails({ appointmentId: appointment.id.toString() })
  }
}
