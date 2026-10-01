import type { Request, Response } from 'express'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import AppointmentFormService, { CreateAppointmentForm } from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import ProjectQuestions, { ProjectQuestionsBody } from '../../../utils/components/projectQuestions'
import getProjectsAndTeams, { ProjectsAndTeamsViewData } from '../../shared/getProjectsAndTeams'
import { ValidationErrors } from '../../../@types/user-defined'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class ProjectController extends BaseOtherEteController<ProjectQuestionsBody, ProjectsAndTeamsViewData> {
  protected pageName: OtherEteFormPage = 'project'

  protected templatePath = 'appointments/update/chooseProject'

  constructor(
    formService: AppointmentFormService,
    offenderService: OffenderService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
  ) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'outcome'
  }

  protected backPage(form: CreateAppointmentForm): OtherEteFormPage | undefined {
    if (form.options?.showRegionQuestion) {
      return 'region'
    }
    return undefined
  }

  protected async getContextData({
    req,
    res,
    form,
  }: {
    req: Request
    res: Response
    form: CreateAppointmentForm
  }): Promise<ProjectsAndTeamsViewData> {
    const teamCode = this.determinePropertyValue(req, form, 'team', 'projectTeam')
    const projectCode = this.determinePropertyValue(req, form, 'project', 'project')

    return getProjectsAndTeams({
      projectService: this.projectService,
      providerService: this.providerService,
      projectTypeGroup: form.projectTypeGroup,
      providerCode: form.provider.code,
      teamCode,
      projectCode,
      response: res,
      project: form.project ? { projectName: form.project.name, projectCode: form.project.code } : undefined,
    })
  }

  private determinePropertyValue(
    req: Request,
    form: CreateAppointmentForm,
    requestProperty: 'team' | 'project',
    formProperty: 'projectTeam' | 'project',
  ) {
    if (req.method === 'POST') {
      // return the user inputted value
      return req.body[requestProperty]
    }

    // return the value from the query string or otherwise that on the form
    return req.query[requestProperty] ?? form[formProperty]?.code
  }

  protected async getStepViewData({
    contextData,
  }: OtherEteStepViewDataParams<ProjectsAndTeamsViewData>): Promise<object> {
    return contextData
  }

  protected validate(query: ProjectQuestionsBody): ValidationErrors<ProjectQuestionsBody> {
    return ProjectQuestions.getValidationErrors(query)
  }

  protected updateForm(
    form: CreateAppointmentForm,
    body: ProjectQuestionsBody,
    contextData: ProjectsAndTeamsViewData,
  ): CreateAppointmentForm {
    return ProjectQuestions.updateFormData(form, body, contextData)
  }
}
