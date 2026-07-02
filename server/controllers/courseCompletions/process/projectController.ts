import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import AuditService, { Page } from '../../../services/auditService'
import getProjectsAndTeams from '../../shared/getProjectsAndTeams'

export default class ProjectController extends BaseController<ProjectPage> {
  constructor(
    page: ProjectPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly auditService: AuditService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ courseCompletion, res, req, formId, formData }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const teamCode = this.getPropertyValue({ propertyName: 'team', req, formData })
    const projectCode = this.getPropertyValue({ propertyName: 'project', req, formData })

    this.auditService.sendAuditMessage({
      action: Page.VIEW_COURSE_COMPLETION_PROJECT,
      username: res.locals.user.username,
      details: req.params,
      correlationId: req.id,
    })

    const items = await getProjectsAndTeams({
      projectService: this.projectService,
      providerService: this.providerService,
      projectTypeGroup: 'ETE',
      providerCode,
      teamCode,
      projectCode,
      response: res,
    })

    return { ...items, form: formId }
  }
}
