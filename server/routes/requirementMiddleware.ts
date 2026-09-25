import { NextFunction, Request, Response } from 'express'
import { Params, Path } from 'static-path'
import OffenderService from '../services/offenderService'
import { pathWithQuery } from '../utils/utils'
import { ViewAppointmentsNavigationTabs } from '../pages/appointments/viewAppointmentsPage'
import { ViewAppointmentsNavigationTabValues } from '../@types/user-defined'
import Offender from '../models/offender'

type RequirementMiddlewareOptions = {
  mode?: 'create' | 'view' | 'checkHasMinimumOneRequirement'
  paramBuilder?: (req: Request) => Record<string, unknown>
}

export default function requirementMiddleware<Pattern extends `/${string}`>(
  offenderService: OffenderService,
  path: Path<Pattern>,
  options: RequirementMiddlewareOptions = {},
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { crn, projectCode, date } = req.params
    const { mode = 'create' } = options

    const { unpaidWorkDetails, offender } = await offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    const person = new Offender(offender)

    if (person.isLimited) {
      return next()
    }

    if (mode === 'checkHasMinimumOneRequirement') {
      if (unpaidWorkDetails.length === 0) {
        const params = (options.paramBuilder ? options.paramBuilder(req) : {}) as unknown as Params<Pattern>

        return res.render('people/noRequirements', {
          person,
          backLink: pathWithQuery(path(params), req.query as Record<string, string>),
        })
      }
      return next()
    }

    if (unpaidWorkDetails.length === 1) {
      const deliusEventNumber = unpaidWorkDetails[0].eventNumber.toString()

      if (mode === 'view') {
        const viewParams = {
          crn,
          deliusEventNumber,
          appointmentSection: ViewAppointmentsNavigationTabs.upcoming.path,
        } as { appointmentSection: ViewAppointmentsNavigationTabValues['path'] } as unknown as Params<Pattern>

        return res.redirect(path(viewParams))
      }

      const createParams = {
        deliusEventNumber,
        crn,
        projectCode,
        date,
      } as unknown as Params<Pattern>

      return res.redirect(
        pathWithQuery(path(createParams), req.query as Record<string, string>, {
          encode: true,
        }),
      )
    }

    return next()
  }
}
