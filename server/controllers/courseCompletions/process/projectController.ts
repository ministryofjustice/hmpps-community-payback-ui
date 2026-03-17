import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import getTeams from '../../shared/getTeams'
import ProviderService from '../../../services/providerService'

export default class ProjectController extends BaseController<ProjectPage> {
  constructor(
    page: ProjectPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ courseCompletion, res }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const teamItems = await getTeams({
      providerService: this.providerService,
      providerCode,
      response: res,
    })
    return { teamItems }
  }
}
