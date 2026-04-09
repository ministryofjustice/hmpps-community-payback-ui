import type { Request, RequestHandler, Response } from 'express'
import paths from '../../paths'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import SearchTravelTimePage from '../../pages/appointments/searchTravelTimePage'
import OffenderService from '../../services/offenderService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'

export default class AdjustTravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly providerService: ProviderService,
    private readonly appointmentService: AppointmentService,
    private readonly offenderService: OffenderService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const form = await this.getProviders(res)

      res.render('appointments/update/travelTime/index', {
        form,
        backLink: '/',
        rows: [],
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId, taskId } = req.params
      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const viewData = this.page.viewData(appointment, taskId)
      const errorList = generateErrorTextList(res.locals.errorMessages)

      res.render('appointments/update/travelTime/update', { ...viewData, errorList })
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId, taskId } = req.params

      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const { hours, minutes } = req.body
        const time = {
          hours,
          minutes,
        }

        const viewData = {
          ...this.page.viewData(appointment, taskId),
          errorSummary,
          errors,
          time,
        }

        return res.render('appointments/update/travelTime/update', viewData)
      }

      const requestBody = this.page.requestBody(req.body, taskId)

      try {
        await this.offenderService.adjustTravelTime(
          {
            crn: appointment.offender.crn,
            deliusEventNumber: appointment.deliusEventNumber,
            username: res.locals.user.username,
          },
          requestBody,
        )

        const successMessage = this.page.successMessage(appointment, requestBody.minutes)

        req.flash('success', successMessage)

        return res.redirect(paths.appointments.travelTime.index({}))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, this.page.updatePath(appointment, taskId))
      }
    }
  }

  filter(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider?.toString() || undefined
      const { hasErrors, errorSummary, errors } = new SearchTravelTimePage().validationErrors({
        provider: providerCode,
      })

      const form = await this.getProviders(res, providerCode)

      if (hasErrors) {
        return res.render('appointments/update/travelTime/index', {
          form,
          backLink: '/',
          rows: [],
          errors,
          errorSummary,
        })
      }

      const tasks = await this.appointmentService.getAppointmentTasks(res.locals.user.username, { providerCode })

      return res.render('appointments/update/travelTime/index', {
        form,
        backLink: '/',
        rows: SearchTravelTimePage.getRows(tasks),
      })
    }
  }

  private async getProviders(res: Response, providerCode: string = undefined) {
    const providers = await this.providerService.getProviders(res.locals.user.username)

    if (providers.length === 1) {
      const [dto] = providers
      const provider = { text: dto.name, value: dto.code }
      return { provider }
    }
    const providerItems = GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', providerCode)
    return { providerItems }
  }
}
