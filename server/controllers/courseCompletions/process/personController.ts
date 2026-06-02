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
    const recommendation = await this.courseCompletionService.getRecommendedSelection({
      id: req.params.id,
      username: res.locals.user.username,
    })

    const shouldSkipBackToCrn = Boolean(recommendation.crn) && recommendation.crn === formData.crn

    this.auditService.sendAuditMessage({
      action: Page.VIEW_CONFIRM_CRN_MATCH,
      username: res.locals.user.username,
      details: req.params,
      correlationId: req.id,
      subjectType: 'CRN',
      subjectId: crn,
    })

    return this.page.stepViewData({
      courseCompletion,
      offender,
      formId,
      shouldSkipBackToCrn,
      originalSearch: this.getOriginalSearch(req, formData) ?? {},
    })
  }
}
