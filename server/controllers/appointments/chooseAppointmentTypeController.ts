import { RequestHandler, Request, Response } from 'express'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import Offender from '../../models/offender'
import paths from '../../paths'
import OffenderService from '../../services/offenderService'
import { originalPathOr, pathWithOriginalPath } from '../../utils/utils'

export default class ChooseAppointmentTypeController {
  constructor(private readonly offenderService: OffenderService) {}

  show(): RequestHandler {
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
      )

      const backLink = originalPathOr(
        req.query,
        paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
      )

      const updatePath = pathWithOriginalPath(
        paths.people.createAppointment({ crn, deliusEventNumber }),
        req.originalUrl,
      )

      return res.render('appointments/chooseAppointmentType', { heading, items, backLink, updatePath })
    }
  }
}
