import { RequestHandler, Request, Response, NextFunction } from 'express'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import Offender from '../../models/offender'
import paths from '../../paths'
import OffenderService from '../../services/offenderService'
import RecordActivityFormService from '../../services/forms/recordActivityFormService'
import { originalPathOr, pathWithOriginalPath } from '../../utils/utils'
import { ErrorViewData } from '../../utils/errorUtils'
import AppointmentTypePage, { AppointmentTypePageBody } from '../../pages/appointments/appointmentTypePage'
import { buildOtherEtePath } from '../../pages/appointments/otherEte/pathMap'
import config from '../../config'
import AppointmentUtils from '../../utils/appointmentUtils'
import { ProjectTypeDto } from '../../@types/shared'

export default class ChooseAppointmentTypeController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly appointmentTypePage: AppointmentTypePage,
    private readonly recordActivityFormService: RecordActivityFormService,
  ) {}

  show(validationResults?: ErrorViewData<AppointmentTypePageBody>): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber } = req.params

      const offenderSummary = await this.offenderService.getOffenderSummary({ crn, username: res.locals.user.username })
      const heading = Offender.buildHeading(offenderSummary.offender)

      const availableAppointmentTypes: Array<ProjectTypeDto['group']> = ['INDUCTION', 'GROUP', 'INDIVIDUAL']

      if (config.featureFlags.otherEteEnabled) {
        availableAppointmentTypes.push('OTHER_ETE')
      }

      const options = availableAppointmentTypes.map(value => ({
        label: AppointmentUtils.appointmentTypeDescriptions[value],
        value,
      }))

      const items = GovUkCheckboxes.getOptions(options, 'label', 'value', [req.body?.appointmentType])

      const backLink = originalPathOr(
        req.query,
        paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
      )

      const updatePath = pathWithOriginalPath(
        paths.people.createAppointment.chooseType({ crn, deliusEventNumber }),
        req.originalUrl,
      )

      return res.render('appointments/chooseAppointmentType', {
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

      const { crn, deliusEventNumber } = req.params

      if (req.body.appointmentType === 'OTHER_ETE') {
        const { formId } = await this.recordActivityFormService.createForm(res.locals.user.username, {
          crn,
          deliusEventNumber,
        })

        return res.redirect(pathWithOriginalPath(buildOtherEtePath('region', formId), req.originalUrl))
      }

      return res.redirect(
        pathWithOriginalPath(
          paths.people.createAppointment.start({
            crn,
            deliusEventNumber,
            projectTypeGroup: req.body.appointmentType,
          }),
          req.originalUrl,
        ),
      )
    }
  }
}
