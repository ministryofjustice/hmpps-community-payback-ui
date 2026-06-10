import { ProviderTeamSummariesDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

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
  protected page: AppointmentFormPage = 'choose-supervisor'

  validationErrors: ValidationErrors<Body> = {}

  constructor(private readonly query: AppointmentDetailsQuery) {
    super(query)
  }

  get hasErrors() {
    return Object.keys(this.validationErrors).length > 0
  }

  protected getForm(
    data: AppointmentOutcomeForm,
    teams: ProviderTeamSummariesDto,
    supervisors: SupervisorSummaryDto[],
  ): AppointmentOutcomeForm {
    const selectedTeam = teams.providers.find(team => team.code === this.query.team)
    const selectedSupervisor = supervisors.find(supervisor => supervisor.code === this.query.supervisor)
    return {
      ...data,
      team: selectedTeam,
      supervisor: selectedSupervisor,
    }
  }

  viewData(
    appointmentOrSession: AppointmentOrSession,
    teams: ProviderTeamSummariesDto,
    supervisors: SupervisorSummaryDto[],
    form: AppointmentOutcomeForm,
  ): ViewData {
    const teamCode = this.query.team || form.team?.code
    const code = this.hasErrors ? this.query.supervisor : form.supervisor?.code

    return {
      ...this.commonViewData({ appointmentOrSession }),
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

  protected backPage(): AppointmentFormPage {
    return 'appointment-details'
  }

  protected nextPage(): AppointmentFormPage {
    return 'attendance-outcome'
  }
}
