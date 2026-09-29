import { AppointmentOrSessionParams, AppointmentUpdateQuery, ValidationErrors } from '../../@types/user-defined'
import { ProjectsAndTeamsViewData } from '../../controllers/shared/getProjectsAndTeams'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import SelectProjectComponent, { ProjectQuestionsBody } from '../../utils/components/projectQuestions'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'

type Query = AppointmentUpdateQuery & ProjectQuestionsBody

export default class ChooseProjectPage extends BaseAppointmentUpdatePage<Query, ProjectsAndTeamsViewData> {
  protected page: AppointmentPage = 'choose-project'

  protected nextPage(): AppointmentPage | undefined {
    return 'attendance-outcome'
  }

  protected backPage(_params: AppointmentOrSessionParams): AppointmentPage | undefined {
    return 'choose-supervisor'
  }

  protected getForm(
    form: AppointmentOutcomeForm,
    query: Query,
    viewData: ProjectsAndTeamsViewData,
  ): AppointmentOutcomeForm {
    return SelectProjectComponent.updateFormData(form, query, viewData)
  }

  protected getValidationErrors(query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    return SelectProjectComponent.getValidationErrors(query)
  }
}
