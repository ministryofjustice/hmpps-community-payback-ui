import type { Request, RequestHandler, Response } from 'express'

import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import AuditService, { Page } from '../../../services/auditService'
import paths from '../../../paths'
import { pathWithQuery } from '../../../utils/utils'

export default class CrnController extends BaseController<CrnPage> {
  constructor(
    page: CrnPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly auditService: AuditService,
  ) {
    super(page, courseCompletionService, formService)
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const resultPath = pathWithQuery(
        paths.courseCompletions.checkCrn({ id: req.params.id, crn: ':crn' }),
        req.query as Record<string, string>,
        {
          encode: true,
        },
      )

      const { formData } = await this.getForm(req, res)

      return res.render('courseCompletions/process/crn', {
        backLink: pathWithQuery(
          paths.courseCompletions.show({ id: req.params.id }),
          { ...formData.originalSearch, ...req.query } as Record<string, string>,
          { encode: true },
        ),
        resultPath,
      })
    }
  }

  protected override getStepViewData({ req, courseCompletion, formData }: StepViewDataParams) {
    return Promise.resolve(this.page.stepViewData(courseCompletion, req.body, formData))
  }

  override submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletionId = req.params.id.toString()

      const { formId, formData } = await this.getForm(req, res, true)

      this.auditService.sendAuditMessage({
        action: Page.SEARCH_COURSE_COMPLETION_CRN,
        username: res.locals.user.username,
        details: req.params,
        correlationId: req.id,
        subjectType: 'SEARCH_TERM',
        subjectId: req.params.crn.trim(),
      })

      const updatedFormData = this.page.getFormData(formData, req.params)
      await this.courseCompletionFormService.saveForm(formId, res.locals.user.username, updatedFormData)

      return res.redirect(this.page.nextPath(courseCompletionId, formId))
    }
  }
}
