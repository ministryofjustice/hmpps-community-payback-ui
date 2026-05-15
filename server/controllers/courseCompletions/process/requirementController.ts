import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import OffenderService from '../../../services/offenderService'
import AuditService, { Page } from '../../../services/auditService'

export default class RequirementController extends BaseController<RequirementPage> {
  constructor(
    page: RequirementPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
    private readonly auditService: AuditService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ res, req, formData }: StepViewDataParams) {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const deliusEventNumber = this.getPropertyValue({ propertyName: 'deliusEventNumber', req, formData })

    const { unpaidWorkDetails } = await this.offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    const unpaidWorkOptions = this.page.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

    this.auditService.hmppsAuditClient.sendAuditMessage(
      Page.VIEW_COURSE_COMPLETION_REQUIREMENT,
      res.locals.user.username,
      req.params,
      req.id,
      'CRN',
      crn,
    )

    return { unpaidWorkOptions }
  }
}
