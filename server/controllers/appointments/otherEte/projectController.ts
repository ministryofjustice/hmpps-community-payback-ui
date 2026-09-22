import type { Request, Response } from 'express'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import ProjectQuestions, { ProjectQuestionsBody } from '../../../utils/components/projectQuestions'
import getProjectsAndTeams, { ProjectsAndTeamsViewData } from '../../shared/getProjectsAndTeams'
import { ValidationErrors } from '../../../@types/user-defined'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class ProjectController extends BaseOtherEteController<ProjectsAndTeamsViewData> {
  protected pageName: OtherEteFormPage = 'project'

  constructor(
    formService: RecordActivityFormService,
    offenderService: OffenderService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
  ) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'outcome'
  }

  protected backPage(): OtherEteFormPage {
    return 'region'
  }

  protected getTemplatePath(): string {
    return 'appointments/update/chooseProject'
  }

  protected async getContextData({
    req,
    res,
    form,
  }: {
    req: Request
    res: Response
    form: RecordActivityForm
  }): Promise<ProjectsAndTeamsViewData> {
    const teamCode = req.method === 'GET' ? (req.query.team ?? form.projectTeam?.code) : req.body.team
    const projectCode = (req.body?.project ?? form.project?.code)?.toString()

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

  protected async getStepViewData({
    contextData,
  }: OtherEteStepViewDataParams<ProjectsAndTeamsViewData>): Promise<object> {
    return contextData
  }

  protected validate(query: ProjectQuestionsBody): ValidationErrors<ProjectQuestionsBody> {
    return ProjectQuestions.getValidationErrors(query)
  }

  protected updateForm(
    form: RecordActivityForm,
    body: ProjectQuestionsBody,
    contextData: ProjectsAndTeamsViewData,
  ): RecordActivityForm {
    return ProjectQuestions.updateFormData(form, body, contextData)
  }
}
