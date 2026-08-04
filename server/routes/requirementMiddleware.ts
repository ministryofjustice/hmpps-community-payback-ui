import { NextFunction, Request, Response } from 'express'
import { Params, Path } from 'static-path'
import OffenderService from '../services/offenderService'
import { pathWithQuery } from '../utils/utils'

export default function requirementMiddleware<Pattern extends `/${string}`>(
  offenderService: OffenderService,
  createAppointmentPath: Path<Pattern>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { crn, projectCode, date } = req.params

    const { unpaidWorkDetails } = await offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    if (unpaidWorkDetails.length === 0) {
      return res.redirect('/')
    }
    const params = {
      deliusEventNumber: unpaidWorkDetails[0].eventNumber.toString(),
      crn,
      projectCode,
      date,
    } as unknown as Params<Pattern>

    if (unpaidWorkDetails.length === 1) {
      return res.redirect(pathWithQuery(createAppointmentPath(params), req.query as Record<string, string>))
    }

    return next()
  }
}
