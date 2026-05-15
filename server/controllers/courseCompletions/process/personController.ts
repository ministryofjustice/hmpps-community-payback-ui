import PersonPage, { PersonPageViewData } from '../../../pages/courseCompletions/process/personPage'
import AuditService, { Page } from '../../../services/auditService'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import OffenderService from '../../../services/offenderService'
import BaseController, { StepViewDataParams } from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(
    page: PersonPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
    private readonly auditService: AuditService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({
    req,
    res,
    formData,
    formId,
    courseCompletion,
  }: StepViewDataParams): Promise<PersonPageViewData> {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const { offender } = await this.offenderService.getOffenderSummary({ username: res.locals.user.username, crn })

    this.auditService.hmppsAuditClient.sendAuditMessage(
      Page.VIEW_CONFIRM_CRN_MATCH,
      res.locals.user.username,
      req.params,
      req.id,
      'CRN',
      crn,
    )

    return this.page.stepViewData({ courseCompletion, offender, formId })
  }
}
