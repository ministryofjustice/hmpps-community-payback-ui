import type { Request, RequestHandler, Response } from 'express'
import OffenderService from '../services/offenderService'
import Offender from '../models/offender'
import UnpaidWorkUtils from '../utils/unpaidWorkUtils'
import paths from '../paths'
import RequirementPage from '../pages/appointments/requirementPage'
import AppointmentFormService, { CreateAppointmentForm } from '../services/forms/appointmentFormService'
import { pathWithQuery } from '../utils/utils'

export default class RequirementController {
  constructor(
    private readonly formService: AppointmentFormService,
    private readonly offenderService: OffenderService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, projectCode, date, form } = req.params

      let deliusEventNumber = null

      const { unpaidWorkDetails, offender } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn,
      })

      const person = new Offender(offender)

      if (form) {
        const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
        deliusEventNumber = formData.deliusEventNumber ? Number(formData.deliusEventNumber) : null
      }

      const unpaidWorkOptions = UnpaidWorkUtils.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

      res.render('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath: paths.sessions.create.requirement({ crn, projectCode, date }),
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, projectCode, date, form } = req.params

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
          updatePath: paths.sessions.create.requirement({ crn, projectCode, date }),
          errorSummary,
          errors,
        })
      }

      if (form) {
        const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
        this.formService.saveForm(form, res.locals.user.username, {
          ...formData,
          deliusEventNumber: req.body.deliusEventNumber,
        })

        return res.redirect(
          pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
            form,
          }),
        )
      }

      return res.redirect(
        paths.sessions.create.createAppointment({
          crn,
          projectCode,
          date,
          deliusEventNumber: req.body.deliusEventNumber,
        }),
      )
    }
  }
}
