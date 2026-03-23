import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'

export default class ConfirmController extends BaseController<ConfirmPage> {
  constructor(
    page: ConfirmPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ req, formData, formId, courseCompletion, res }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const { username } = res.locals.user
    const teams = await this.providerService.getTeams(providerCode, username)
    const projects = formData.team
      ? (
          await this.projectService.getProjects({
            projectTypeGroup: 'ETE',
            username,
            providerCode,
            teamCode: formData.team,
          })
        ).content
      : []
    return this.page.stepViewData(req.params.id, formData, formId, teams.providers, projects)
  }
}
