import type { Request, RequestHandler, Response } from 'express'
import OffenderService from '../services/offenderService'
import AdjustmentService from '../services/adjustmentService'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from '../utils/dateTimeUtils'
import { catchApiValidationErrorOrPropagate } from '../utils/errorUtils'
import { originalPathOr, pathWithOriginalPath } from '../utils/utils'

export default class DeleteAdjustmentController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly adjustmentService: AdjustmentService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, adjustmentId } = req.params

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: crn,
      }

      const [offenderSummary, adjustment] = await Promise.all([
        this.offenderService.getOffenderSummary({ username: res.locals.user.username, crn }),
        this.adjustmentService.getAdjustment(adjustmentId, res.locals.user.username),
      ])

      const offender = new Offender(offenderSummary.offender)
      const adjustmentsLink = this.adjustmentsLink(req)

      return res.render('people/adjustments/delete', {
        heading: { title: offender.name, caption: offender.crn },
        formattedDate: DateTimeFormats.isoDateToUIDate(adjustment.date),
        reason: adjustment.reason,
        adjustmentTime: DateTimeFormats.formatAdjustmentTime(adjustment.amount),
        backLink: adjustmentsLink,
        cancelLink: adjustmentsLink,
        updatePath: this.deletePath(req),
        preventDoubleClick: true,
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, adjustmentId } = req.params

      try {
        await this.adjustmentService.deleteAdjustment(adjustmentId, res.locals.user.username)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: crn,
        }

        req.flash('success', 'Adjustment has been deleted')

        return res.redirect(this.adjustmentsLink(req))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, this.deletePath(req))
      }
    }
  }

  private adjustmentsLink(req: Request): string {
    const { crn, deliusEventNumber } = req.params

    return originalPathOr(
      req.query,
      paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'adjustments' }),
    )
  }

  private deletePath(req: Request): string {
    const { crn, deliusEventNumber, adjustmentId } = req.params

    return pathWithOriginalPath(
      paths.people.adjustments.delete({ crn, deliusEventNumber, adjustmentId }),
      req.query.originalPath?.toString(),
    )
  }
}
