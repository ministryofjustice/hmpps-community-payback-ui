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
import AuditService, { Page } from '../../services/auditService'
import Offender from '../../models/offender'
import DateTimeFormats from '../../utils/dateTimeUtils'
import AdjustmentService from '../../services/adjustmentService'
import AdjustmentUtils from '../../utils/adjustmentUtils'

export const travelTimeSortFields = ['appointment.crn', 'appointment.date'] as const

export default class AdjustTravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly auditService: AuditService,
    private readonly providerService: ProviderService,
    private readonly appointmentService: AppointmentService,
    private readonly offenderService: OffenderService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly projectService: ProjectService,
    private readonly adjustmentService: AdjustmentService,
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
      const isTask = Boolean(taskId)
      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const contactOutcome = appointment.contactOutcomeCode
        ? await this.referenceDataService.getContactOutcome(res.locals.user.username, appointment.contactOutcomeCode)
        : undefined

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const project = await this.projectService.getProject({ projectCode, username: res.locals.user.username })

      const viewData = this.page.viewData({
        appointment,
        taskId,
        contactOutcome,
        project,
        originalSearch: req.query as SearchTravelTimePageInput,
        req,
        isTask,
      })
      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true

      res.render('appointments/update/travelTime/update', { ...viewData, errorList, preventDoubleClick })
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId, taskId } = req.params
      const isTask = Boolean(taskId)

      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const { hasErrors, errorSummary, errors } = this.page.validationErrors(req.body)

      if (hasErrors) {
        const contactOutcome = appointment.contactOutcomeCode
          ? await this.referenceDataService.getContactOutcome(res.locals.user.username, appointment.contactOutcomeCode)
          : undefined

        const project = await this.projectService.getProject({ projectCode, username: res.locals.user.username })

        const preventDoubleClick = true

        const viewData = {
          ...this.page.viewData({
            appointment,
            taskId,
            contactOutcome,
            project,
            originalSearch: req.query as SearchTravelTimePageInput,
            req,
            isTask,
          }),
          errorSummary,
          errors,
          preventDoubleClick,
        }

        return res.render('appointments/update/travelTime/update', viewData)
      }

      const requestBody = this.page.requestBody(req.body, appointment)

      try {
        await this.offenderService.adjustTravelTime(
          {
            crn: appointment.offender.crn,
            deliusEventNumber: appointment.deliusEventNumber,
            username: res.locals.user.username,
          },
          requestBody,
        )

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: appointment.offender.crn,
        }

        const successMessage = this.page.successMessage(appointment, requestBody.minutes)

        req.flash('success', successMessage)

        return res.redirect(this.page.exitPath(req.query as SearchTravelTimePageInput, appointment, isTask))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(
          req,
          res,
          error,
          this.page.updatePath(appointment, taskId, req.query, isTask),
        )
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

      const { page, hrefPrefix, sortBy, sortDirection, size, sort } = getPaginationRequestParams<TravelTimeSortField>(
        _req,
        paths.appointments.travelTime.filter({}),
        'createdAt',
        travelTimeSortFields,
      )

      const tasks = await this.appointmentService.getAppointmentTasks({
        username: res.locals.user.username,
        providerCode,
        page,
        sort,
        size,
      })

      tasks.content.forEach(task => {
        if (task.offender?.crn) {
          this.auditService.sendAuditMessage({
            action: Page.VIEW_TRAVEL_TIME_TASKS,
            username: res.locals.user.username,
            details: _req.params,
            correlationId: _req.id,
            subjectType: 'CRN',
            subjectId: task.offender.crn,
          })
        }
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

      try {
        await this.appointmentService.completeAppointmentTask(res.locals.user.username, taskId)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: appointment.offender.crn,
        }

        const successMessage = this.page.successMessage(appointment)

        req.flash('success', successMessage)

        return res.redirect(this.page.exitPath(req.query as SearchTravelTimePageInput, appointment))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, this.page.updatePath(appointment, taskId, req.query))
      }
    }
  }

  delete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { appointmentId, projectCode } = req.params

      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const appointmentLink = paths.appointments.update({ page: 'appointment-details', projectCode, appointmentId })

      const travelTimeAdjustment = AdjustmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)

      if (!travelTimeAdjustment) {
        return res.redirect(paths.appointments.update({ page: 'appointment-details', projectCode, appointmentId }))
      }

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const errorList = generateErrorTextList(res.locals.errorMessages)

      const project = await this.projectService.getProject({ projectCode, username: res.locals.user.username })

      const offender = new Offender(appointment.offender)

      return res.render('appointments/update/travelTime/delete', {
        heading: { title: offender.name, caption: offender.crn },
        appointment,
        project,
        totalTravelTime: AdjustmentUtils.getTravelTimeAdjustmentText(travelTimeAdjustment),
        formattedDate: DateTimeFormats.isoDateToUIDate(appointment.date),
        appointmentLink,
        backLink: appointmentLink,
        updatePath: paths.appointments.travelTime.delete({ projectCode, appointmentId }),
        errorList,
      })
    }
  }

  submitDelete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { appointmentId, projectCode } = req.params

      const appointment = await this.appointmentService.getAppointment({
        projectCode,
        appointmentId,
        username: res.locals.user.username,
      })

      const travelTimeAdjustment = AdjustmentUtils.getTravelTimeAdjustmentFromAppointment(appointment)

      if (!travelTimeAdjustment) {
        return res.redirect(paths.appointments.update({ page: 'appointment-details', projectCode, appointmentId }))
      }

      try {
        await this.adjustmentService.deleteAdjustment(travelTimeAdjustment.id, res.locals.user.username)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: appointment.offender.crn,
        }

        req.flash('success', 'Travel time has been deleted.')

        return res.redirect(paths.appointments.update({ page: 'appointment-details', projectCode, appointmentId }))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(
          req,
          res,
          error,
          paths.appointments.travelTime.delete({ projectCode, appointmentId }),
        )
      }
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
