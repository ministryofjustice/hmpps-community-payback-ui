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

  protected override async getStepViewData({ courseCompletion, res, formId }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const teamItems = await getTeams({
      providerService: this.providerService,
      providerCode,
      response: res,
    })
    const showPath = this.page.updatePath(courseCompletion.id, undefined)
    return { teamItems, form: formId, showPath }
  }
}
