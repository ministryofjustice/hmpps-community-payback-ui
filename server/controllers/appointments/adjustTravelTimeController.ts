import type { Request, RequestHandler, Response } from 'express'
import paths from '../../paths'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import SearchTravelTimePage from '../../pages/appointments/searchTravelTimePage'

export default class AdjustTravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly providerService: ProviderService,
    private readonly appointmentService: AppointmentService,
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
      const { projectCode, appointmentId } = req.params
      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const viewData = this.page.viewData(appointment)

      res.render('appointments/update/travelTime/update', viewData)
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId } = req.params
      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const { hours, minutes } = req.body
        const time = {
          hours,
          minutes,
        }

        const appointment = await this.appointmentService.getAppointment({
          projectCode,
          appointmentId,
          username: res.locals.user.username,
        })

        const viewData = {
          ...this.page.viewData(appointment),
          errorSummary,
          errors,
          time,
        }

        return res.render('appointments/update/travelTime/update', viewData)
      }
      return res.redirect(paths.appointments.travelTime.index({}))
    }
  }

  filter(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider?.toString() || undefined

      const form = await this.getProviders(res, providerCode)

      const validationErrors = SearchTravelTimePage.validationErrors({ provider: providerCode })

      if (validationErrors.hasErrors) {
        return res.render('appointments/update/travelTime/index', {
          form,
          backLink: '/',
          rows: [],
          errors: validationErrors.errors,
          errorSummary: validationErrors.errorSummary,
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
