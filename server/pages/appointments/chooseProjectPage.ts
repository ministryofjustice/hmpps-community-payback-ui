import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import SelectProjectComponent, { ProjectQuestionsBody } from '../../utils/components/projectQuestions'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

type Query = AppointmentUpdateQuery & ProjectQuestionsBody

export default class ChooseProjectPage extends BaseAppointmentUpdatePage<Query> {
  protected page: AppointmentFormPage = 'choose-project'

  protected nextPage(): AppointmentFormPage | undefined {
    return 'attendance-outcome'
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage | undefined {
    return 'choose-supervisor'
  }

  getForm(
    form: AppointmentOutcomeForm,
    teams: Array<GovUkSelectOption>,
    projects: Array<GovUkSelectOption>,
    query: Query,
  ): AppointmentOutcomeForm {
    const selectedTeam = teams.find(team => team.value === query.team)
    const selectedProject = projects.find(project => project.value === query.project)

    if (!selectedTeam) {
      throw new Error(`Selected team with code ${query.team} was not found.`)
    }

    if (!selectedProject) {
      throw new Error(`Selected project with code ${query.project} was not found.`)
    }

    return {
      ...form,
      projectTeam: { code: selectedTeam.value, name: selectedTeam.text },
      project: { code: selectedProject.value, name: selectedProject.text },
    }
  }

  protected getValidationErrors(query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    return SelectProjectComponent.getValidationErrors(query)
  }
}
