import type { Request, RequestHandler, Response } from 'express'
import paths from '../../paths'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import SearchTravelTimePage, { SearchTravelTimePageInput } from '../../pages/appointments/searchTravelTimePage'
import OffenderService from '../../services/offenderService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import ReferenceDataService from '../../services/referenceDataService'
import ProjectService from '../../services/projectService'
import { getPaginationRequestParams } from '../../utils/paginationUtils'
import { TravelTimeSortField } from '../../@types/user-defined'

export const travelTimeSortFields = ['appointment.crn', 'appointment.date'] as const

export default class AdjustTravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly providerService: ProviderService,
    private readonly appointmentService: AppointmentService,
    private readonly offenderService: OffenderService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly projectService: ProjectService,
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

      const { contactOutcomes } = await this.referenceDataService.getAvailableContactOutcomes(res.locals.user.username)
      const project = await this.projectService.getProject({ projectCode, username: res.locals.user.username })

      const viewData = this.page.viewData({
        appointment,
        taskId,
        contactOutcomes,
        project,
        originalSearch: req.query as SearchTravelTimePageInput,
      })
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

        const { contactOutcomes } = await this.referenceDataService.getAvailableContactOutcomes(
          res.locals.user.username,
        )

        const project = await this.projectService.getProject({ projectCode, username: res.locals.user.username })

        const viewData = {
          ...this.page.viewData({
            appointment,
            taskId,
            contactOutcomes,
            project,
            originalSearch: req.query as SearchTravelTimePageInput,
          }),
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

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationRequestParams<TravelTimeSortField>(
        _req,
        paths.appointments.travelTime.filter({}),
        {
          provider: providerCode,
        },
        travelTimeSortFields,
      )

      const tasks = await this.appointmentService.getAppointmentTasks({
        username: res.locals.user.username,
        providerCode,
        page: pageNumber,
        sortBy,
        sortDirection,
      })

      const tableHeaders = SearchTravelTimePage.tableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)

      return res.render('appointments/update/travelTime/index', {
        form,
        backLink: '/',
        tableHeaders,
        rows: SearchTravelTimePage.getRows(tasks, _req.query as SearchTravelTimePageInput),
        pageNumber: tasks.page.number,
        totalPages: tasks.page.totalPages,
        totalElements: tasks.page.totalElements,
        pageSize: tasks.page.size,
        hrefPrefix,
      })
    }
  }

  // Mark an adjustment task as complete with no action
  completeTask(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { taskId, appointmentId, projectCode } = req.params

      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      await this.appointmentService.completeAppointmentTask(res.locals.user.username, taskId)

      const successMessage = this.page.successMessage(appointment)

      req.flash('success', successMessage)

      res.redirect(paths.appointments.travelTime.index({}))
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
