import { ProviderTeamSummariesDto, SupervisorSummaryDto } from '../../@types/shared'
import {
  AppointmentOrSessionParams,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
  teamItems: GovUkSelectOption[]
  supervisorItems: GovUkSelectOption[]
}

export interface SupervisorPageContext {
  teams: ProviderTeamSummariesDto
  supervisors: Array<SupervisorSummaryDto>
}

export interface SupervisorPageBody {
  supervisor: string
  team: string
}

interface AppointmentDetailsQuery extends AppointmentUpdateQuery {
  supervisor?: string
  team?: string
}

export default class ChooseSupervisorPage extends BaseAppointmentUpdatePage<SupervisorPageBody, SupervisorPageContext> {
  protected page: AppointmentFormPage = 'choose-supervisor'

  protected getForm(
    data: AppointmentOutcomeForm,
    query: AppointmentDetailsQuery,
    { teams, supervisors }: SupervisorPageContext,
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
    teams: ProviderTeamSummariesDto,
    supervisors: Array<SupervisorSummaryDto>,
    form: AppointmentOutcomeForm,
    query: AppointmentDetailsQuery,
  ): ViewData {
    const teamCode = query?.team || form.supervisingTeam?.code
    const supervisorCode = query?.supervisor ?? form.supervisor?.code

    return {
      teamItems: GovUkSelectInput.getOptions(teams.providers, 'name', 'code', 'Choose team', teamCode),
      supervisorItems: teamCode
        ? GovUkSelectInput.getOptions(supervisors, 'fullName', 'code', 'Choose supervisor', supervisorCode)
        : [],
    }
  }

  protected getValidationErrors(body: SupervisorPageBody): ValidationErrors<SupervisorPageBody> {
    const errors: ValidationErrors<SupervisorPageBody> = {}

    if (!body.team) {
      errors.team = { text: 'Select a supervising team' }
      return errors
    }

    if (!body.supervisor) {
      errors.supervisor = { text: 'Select a supervisor' }
    }

    return errors
  }

  protected backPage(params: AppointmentOrSessionParams): AppointmentFormPage {
    if (params.appointmentId) {
      return 'appointment-details'
    }
    return 'select-people'
  }

  protected nextPage(): AppointmentFormPage {
    return 'choose-project'
  }
}
