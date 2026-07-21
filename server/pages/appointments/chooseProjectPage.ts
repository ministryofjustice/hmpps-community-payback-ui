import {
  AppointmentOrSessionParams,
  AppointmentOutcomeForm,
  AppointmentUpdateQuery,
  ValidationErrors,
} from '../../@types/user-defined'
import { ProjectsAndTeamsViewData } from '../../controllers/shared/getProjectsAndTeams'
import SelectProjectComponent, { ProjectQuestionsBody } from '../../utils/components/projectQuestions'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

type Query = AppointmentUpdateQuery & ProjectQuestionsBody

export default class ChooseProjectPage extends BaseAppointmentUpdatePage<Query, ProjectsAndTeamsViewData> {
  protected page: AppointmentFormPage = 'choose-project'

  protected nextPage(): AppointmentFormPage | undefined {
    return 'attendance-outcome'
  }

  protected backPage(_params: AppointmentOrSessionParams): AppointmentFormPage | undefined {
    return 'choose-supervisor'
  }

  getForm(
    form: AppointmentOutcomeForm,
    query: Query,
    { teamItems, projectItems }: ProjectsAndTeamsViewData,
  ): AppointmentOutcomeForm {
    const selectedTeam = teamItems.find(team => team.value === query.team)
    const selectedProject = projectItems.find(project => project.value === query.project)

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
