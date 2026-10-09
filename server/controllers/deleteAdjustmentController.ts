import type { Request, RequestHandler, Response } from 'express'
import OffenderService from '../services/offenderService'
import AdjustmentService from '../services/adjustmentService'
import Offender from '../models/offender'
import paths from '../paths'
import DateTimeFormats from '../utils/dateTimeUtils'
import { catchApiValidationErrorOrPropagate } from '../utils/errorUtils'

export default class DeleteAdjustmentController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly adjustmentService: AdjustmentService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber, adjustmentId } = req.params

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: crn,
      }

      const [offenderSummary, adjustment] = await Promise.all([
        this.offenderService.getOffenderSummary({ username: res.locals.user.username, crn }),
        this.adjustmentService.getAdjustment(adjustmentId, res.locals.user.username),
      ])

      const offender = new Offender(offenderSummary.offender)
      // TODO: return to the adjustments tab once it exists
      const appointmentsLink = paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' })

      return res.render('people/adjustments/delete', {
        heading: { title: offender.name, caption: offender.crn },
        formattedDate: DateTimeFormats.isoDateToUIDate(adjustment.date),
        reason: adjustment.reason,
        adjustmentTime: adjustment.amount,
        backLink: appointmentsLink,
        cancelLink: appointmentsLink,
        updatePath: paths.people.adjustments.delete({ crn, deliusEventNumber, adjustmentId }),
        preventDoubleClick: true,
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber, adjustmentId } = req.params

      try {
        await this.adjustmentService.deleteAdjustment(adjustmentId, res.locals.user.username)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: crn,
        }

        req.flash('success', 'Adjustment has been deleted')

        // TODO: return to the adjustments tab once it's finished
        return res.redirect(paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(
          req,
          res,
          error,
          paths.people.adjustments.delete({ crn, deliusEventNumber, adjustmentId }),
        )
      }
    }
  }
}
