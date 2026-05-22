import { AppointmentDto, ProviderTeamSummariesDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  teamItems: GovUkSelectOption[]
  supervisorItems: GovUkSelectOption[]
}

interface Body {
  supervisor: string
  team: string
}

interface AppointmentDetailsQuery extends AppointmentUpdateQuery {
  supervisor?: string
  team?: string
}

export default class ChooseSupervisorPage extends BaseAppointmentUpdatePage {
  validationErrors: ValidationErrors<Body> = {}

  constructor(
    private readonly query: AppointmentDetailsQuery,
    private readonly appointment: AppointmentDto,
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

  viewData(
    appointment: AppointmentDto,
    teams: ProviderTeamSummariesDto,
    supervisors: SupervisorSummaryDto[],
    form: AppointmentOutcomeForm,
  ): ViewData {
    const teamCode = this.query.team
    const code = this.hasErrors ? this.query.supervisor : form.supervisor?.code

    return {
      ...this.commonViewData(appointment),
      teamItems: GovUkSelectInput.getOptions(teams.providers, 'name', 'code', 'Choose team', teamCode),
      supervisorItems: teamCode
        ? GovUkSelectInput.getOptions(supervisors, 'fullName', 'code', 'Choose supervisor', code)
        : [],
    }
  }

  validate() {
    if (!this.query.team) {
      this.validationErrors.team = { text: 'Select a supervising team' }
      return
    }

    if (!this.query.supervisor) {
      this.validationErrors.supervisor = { text: 'Select a supervisor' }
    }
  }

  protected backPath(): string {
    return this.pathWithFormId(
      paths.appointments.appointmentDetails({
        projectCode: this.appointment.projectCode,
        appointmentId: this.appointment.id.toString(),
      }),
    )
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    return this.pathWithFormId(paths.appointments.attendanceOutcome({ projectCode, appointmentId }))
  }

  updatePath(appointment: AppointmentDto): string {
    return this.pathWithFormId(
      paths.appointments.chooseSupervisor({
        appointmentId: appointment.id.toString(),
        projectCode: appointment.projectCode,
      }),
    )
  }
}
