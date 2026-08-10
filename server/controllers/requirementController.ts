import type { Request, RequestHandler, Response } from 'express'
import { Params, Path } from 'static-path'
import OffenderService from '../services/offenderService'
import Offender from '../models/offender'
import UnpaidWorkUtils from '../utils/unpaidWorkUtils'
import RequirementPage from '../pages/appointments/requirementPage'
import AppointmentFormService, { CreateAppointmentForm } from '../services/forms/appointmentFormService'
import { pathWithQuery } from '../utils/utils'

export default class RequirementController {
  constructor(
    private readonly formService: AppointmentFormService,
    private readonly offenderService: OffenderService,
  ) {}

  show({ updatePath, backPath }: { updatePath: string; backPath: string }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params
      const form = req.query?.form?.toString()

      let deliusEventNumber = null

      const { unpaidWorkDetails, offender } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn,
      })

      const person = new Offender(offender)

      if (unpaidWorkDetails.length === 0) {
        return res.render('pages/noRequirements', {
          person,
          backLink: pathWithQuery(backPath, req.query as Record<string, string>),
        })
      }

      if (form) {
        const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
        deliusEventNumber = formData.deliusEventNumber ? Number(formData.deliusEventNumber) : null
      }

      const unpaidWorkOptions = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

      return res.render('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath: pathWithQuery(updatePath, req.query as Record<string, string>),
        backLink: pathWithQuery(backPath, req.query as Record<string, string>),
      })
    }
  }

  submit<CreateAppointmentPathPattern extends `/${string}`>({
    backPath,
    updatePath,
    nextPath,
  }: {
    backPath: string
    updatePath: string
    nextPath: Path<CreateAppointmentPathPattern>
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, projectCode, date } = req.params
      const form = req.query?.form?.toString()

      let deliusEventNumber = null

      const requirementPage = new RequirementPage()

      const { hasErrors, errorSummary, errors } = requirementPage.validationErrors(req.body)

      if (hasErrors) {
        const { unpaidWorkDetails, offender } = await this.offenderService.getOffenderSummary({
          username: res.locals.user.username,
          crn,
        })

        if (form) {
          const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
          deliusEventNumber = formData.deliusEventNumber ? Number(formData.deliusEventNumber) : null
        }

        const person = new Offender(offender)

        const unpaidWorkOptions = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

        return res.render('pages/requirement', {
          person,
          unpaidWorkOptions,
          errorSummary,
          errors,
          updatePath: pathWithQuery(updatePath, req.query as Record<string, string>),
          backLink: pathWithQuery(backPath, req.query as Record<string, string>),
        })
      }

      const params = {
        crn,
        projectCode,
        date,
        deliusEventNumber: req.body.deliusEventNumber,
      } as unknown as Params<CreateAppointmentPathPattern>

      return res.redirect(pathWithQuery(nextPath(params), req.query as Record<string, string>))
    }
  }
}
