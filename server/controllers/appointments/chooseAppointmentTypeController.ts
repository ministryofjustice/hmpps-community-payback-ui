import { RequestHandler, Request, Response, NextFunction } from 'express'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import Offender from '../../models/offender'
import paths from '../../paths'
import OffenderService from '../../services/offenderService'
import { originalPathOr, pathWithOriginalPath } from '../../utils/utils'
import { ErrorViewData } from '../../utils/errorUtils'
import AppointmentTypePage, { AppointmentTypePageBody } from '../../pages/appointments/appointmentTypePage'

export default class ChooseAppointmentTypeController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly appointmentTypePage: AppointmentTypePage,
  ) {}

  show(validationResults?: ErrorViewData<AppointmentTypePageBody>): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber } = req.params

      const offenderSummary = await this.offenderService.getOffenderSummary({ crn, username: res.locals.user.username })
      const heading = Offender.buildHeading(offenderSummary.offender)

      const items = GovUkCheckboxes.getOptions(
        [
          {
            label: 'Induction',
            value: 'INDUCTION',
          },
          { label: 'Group session', value: 'GROUP' },
          { label: 'Individual placement', value: 'INDIVIDUAL' },
        ],
        'label',
        'value',
        [req.body?.appointmentType],
      )

      const backLink = originalPathOr(
        req.query,
        paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
      )

      const updatePath = pathWithOriginalPath(
        paths.people.createAppointment({ crn, deliusEventNumber }),
        req.originalUrl,
      )

      return res.render('appointments/create', {
        heading,
        items,
        backLink,
        updatePath,
        errors: validationResults?.errors,
        errorSummary: validationResults?.errorSummary,
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const validationResults = this.appointmentTypePage.validationErrors(req.body)

      if (validationResults.hasErrors) {
        return this.show(validationResults)(req, res, next)
      }

      return res.redirect(
        pathWithOriginalPath(
          paths.people.createAppointmentForProjectType({
            crn: req.params.crn,
            deliusEventNumber: req.params.deliusEventNumber,
            projectTypeGroup: req.body.appointmentType,
          }),
          req.originalUrl,
        ),
      )
    }
  }
}
