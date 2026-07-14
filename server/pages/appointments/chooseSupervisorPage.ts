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

  get hasErrors() {
    return Object.keys(this.validationErrors).length > 0
  }

  protected getForm(
    data: AppointmentOutcomeForm,
    teams: ProviderTeamSummariesDto,
    supervisors: SupervisorSummaryDto[],
    query: AppointmentDetailsQuery,
  ): AppointmentOutcomeForm {
    const selectedTeam = teams.providers.find(team => team.code === query.team)
    const selectedSupervisor = supervisors.find(supervisor => supervisor.code === query.supervisor)
    return {
      ...data,
      supervisingTeam: selectedTeam,
      supervisor: selectedSupervisor,
    }
  }

  viewData(
    appointmentOrSession: AppointmentOrSession,
    teams: ProviderTeamSummariesDto,
    supervisors: SupervisorSummaryDto[],
    form: AppointmentOutcomeForm,
    formId?: string,
    query?: AppointmentDetailsQuery,
  ): ViewData {
    const teamCode = query?.team || form.supervisingTeam?.code
    const code = this.hasErrors ? query?.supervisor : form.supervisor?.code

    return {
      ...this.commonViewData({ appointmentOrSession, form, formId }),
      teamItems: GovUkSelectInput.getOptions(teams.providers, 'name', 'code', 'Choose team', teamCode),
      supervisorItems: teamCode
        ? GovUkSelectInput.getOptions(supervisors, 'fullName', 'code', 'Choose supervisor', code)
        : [],
    }
  }

  validate(query: AppointmentDetailsQuery) {
    if (!query.team) {
      this.validationErrors.team = { text: 'Select a supervising team' }
      return
    }

    if (!query.supervisor) {
      this.validationErrors.supervisor = { text: 'Select a supervisor' }
    }
  }

  protected backPage(appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    if (this.isSingleAppointment(appointmentOrSession)) {
      return 'appointment-details'
    }
    return 'select-people'
  }

  protected nextPage(): AppointmentFormPage {
    return 'choose-project'
  }
}
