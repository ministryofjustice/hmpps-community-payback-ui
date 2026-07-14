import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdateQuery,
  GovUkSelectOption,
} from '../../@types/user-defined'
import SelectProjectComponent, { ProjectQuestionsBody } from '../../utils/components/projectQuestions'
import { ErrorViewData, generateErrorSummary } from '../../utils/errorUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

type Query = AppointmentUpdateQuery & ProjectQuestionsBody

export default class ChooseProjectPage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'choose-project'

  constructor(private query: Query) {
    super()
  }

  protected nextPage(): AppointmentFormPage | undefined {
    return 'attendance-outcome'
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage | undefined {
    return 'choose-supervisor'
  }

  getValidationErrors(): ErrorViewData<ProjectQuestionsBody> {
    const errors = SelectProjectComponent.getValidationErrors(this.query)
    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }

  getForm(
    form: AppointmentOutcomeForm,
    teams: Array<GovUkSelectOption>,
    projects: Array<GovUkSelectOption>,
  ): AppointmentOutcomeForm {
    const selectedTeam = teams.find(team => team.value === this.query.team)
    const selectedProject = projects.find(project => project.value === this.query.project)

    if (!selectedTeam) {
      throw new Error(`Selected team with code ${this.query.team} was not found.`)
    }

    if (!selectedProject) {
      throw new Error(`Selected project with code ${this.query.project} was not found.`)
    }

    return {
      ...form,
      projectTeam: { code: selectedTeam.value, name: selectedTeam.text },
      project: { code: selectedProject.value, name: selectedProject.text },
    }
  }
}
