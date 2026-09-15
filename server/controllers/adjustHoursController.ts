import type { Request, RequestHandler, Response } from 'express'
import OffenderService from '../services/offenderService'
import { generateErrorTextList } from '../utils/errorUtils'
import Offender from '../models/offender'
import AdjustHoursPage from '../pages/adjustHoursPage'
import ReferenceDataService from '../services/referenceDataService'

export default class AdjustHoursController {
  constructor(
    private readonly page: AdjustHoursPage,
    private readonly offenderService: OffenderService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: crn,
      }

      const offenderSummary = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn,
      })

      const adjustmentReasons = await this.referenceDataService.getAdjustmentReasons(res.locals.user.username)
      const offender = new Offender(offenderSummary.offender)

      const viewData = this.page.viewData({
        offender,
        body: req.body,
        adjustmentReasons,
      })

      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true

      res.render('people/adjustHours/update', { ...viewData, errorList, preventDoubleClick })
    }
  }
}
