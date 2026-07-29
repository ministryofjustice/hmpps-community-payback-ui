import { NextFunction, Request, Response } from 'express'
import OffenderService from '../services/offenderService'
import paths from '../paths'

export default function requirementMiddleware(offenderService: OffenderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { crn, projectCode, date } = req.params

    const { unpaidWorkDetails } = await offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    if (unpaidWorkDetails.length === 0) {
      return res.redirect('/')
    }

    if (unpaidWorkDetails.length === 1) {
      return res.redirect(
        paths.sessions.createAppointment({
          deliusEventNumber: unpaidWorkDetails[0].eventNumber.toString(),
          crn,
          projectCode,
          date,
        }),
      )
    }

    return next()
  }
}
