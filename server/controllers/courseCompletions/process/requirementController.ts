import { RequestHandler, Request, Response } from 'express'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import OffenderService from '../../../services/offenderService'
import AuditService, { Page } from '../../../services/auditService'
import UnpaidWorkUtils from '../../../utils/unpaidWorkUtils'

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

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: req.params.id,
      })

      const { formId, formData } = await this.getForm(req, res)

      const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })

      const { unpaidWorkDetails } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn,
      })

      if (unpaidWorkDetails.length === 1) {
        const courseCompletionId = req.params.id.toString()

        if (req.query.backQuery === 'fromProject') {
          return res.redirect(
            this.page.backPath({
              courseCompletionId,
              formId,
            }),
          )
        }
        const updatedFormData = this.page.getFormData(formData, {
          deliusEventNumber: unpaidWorkDetails[0].eventNumber.toString(),
        })
        await this.courseCompletionFormService.saveForm(formId, res.locals.user.username, updatedFormData)

        return res.redirect(this.page.nextPath(courseCompletionId, formId))
      }

      const viewData = {
        ...this.page.viewData(courseCompletion, formId, this.getOriginalSearch(req, formData)),
        ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors: {} })),
      }
      return res.render(this.page.templatePath, viewData)
    }
  }

  protected override async getStepViewData({ res, req, formData }: StepViewDataParams) {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const deliusEventNumber = this.getPropertyValue({ propertyName: 'deliusEventNumber', req, formData })

    const { unpaidWorkDetails } = await this.offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    const unpaidWorkOptions = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

    this.auditService.sendAuditMessage({
      action: Page.VIEW_COURSE_COMPLETION_REQUIREMENT,
      username: res.locals.user.username,
      details: req.params,
      correlationId: req.id,
      subjectType: 'CRN',
      subjectId: crn,
    })

    return { unpaidWorkOptions }
  }
}
