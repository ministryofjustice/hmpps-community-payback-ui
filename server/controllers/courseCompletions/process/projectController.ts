import type { Response } from 'express'

import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import getTeams from '../../shared/getTeams'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import GovUkSelectInput from '../../../forms/GovUkSelectInput'

export default class ProjectController extends BaseController<ProjectPage> {
  constructor(
    page: ProjectPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ courseCompletion, res, req, formId, formData }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const teamCode = this.getPropertyValue({ propertyName: 'team', req, formData })
    const projectCode = this.getPropertyValue({ propertyName: 'project', req, formData })
    const teamItems = await getTeams({
      providerService: this.providerService,
      providerCode,
      response: res,
      teamCode,
    })
    const projectItems = await this.getProjects(res, providerCode, teamCode, projectCode)
    return { teamItems, teamCode, projectItems, form: formId }
  }

  private async getProjects(
    res: Response,
    providerCode: string,
    teamCode?: string,
    projectCode?: string,
  ): Promise<Array<GovUkSelectInput> | undefined> {
    if (!teamCode) {
      return undefined
    }
    const projects = await this.projectService.getProjects({
      projectTypeGroup: 'ETE',
      username: res.locals.user.username,
      providerCode,
      teamCode,
    })

    return GovUkSelectInput.getOptions(
      projects.content ?? [],
      'projectName',
      'projectCode',
      'Choose project',
      projectCode,
    )
  }
}
