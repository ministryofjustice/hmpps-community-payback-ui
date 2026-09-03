import type { Request, RequestHandler, Response } from 'express'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AppointmentService from '../../services/appointmentService'
import OffenderService from '../../services/offenderService'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../utils/errorUtils'
import ReferenceDataService from '../../services/referenceDataService'
import ProjectService from '../../services/projectService'

export default class TravelTimeController {
  constructor(
    private readonly page: UpdateTravelTimePage,
    private readonly appointmentService: AppointmentService,
    private readonly offenderService: OffenderService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly projectService: ProjectService,
  ) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId } = req.params

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
        taskId: null,
        contactOutcome,
        project,
        originalSearch: req.query,
        req,
        fromTravelTimeTasksPage: false,
        withAppointmentLink: true,
      })
      const errorList = generateErrorTextList(res.locals.errorMessages)
      const preventDoubleClick = true

      res.render('appointments/update/travelTime/update', { ...viewData, errorList, preventDoubleClick })
    }
  }

  submitCreate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId } = req.params

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
            taskId: null,
            contactOutcome,
            project,
            originalSearch: req.query,
            req,
            fromTravelTimeTasksPage: false,
            withAppointmentLink: true,
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

        return res.redirect(this.page.exitPath(req.query, appointment, false))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(
          req,
          res,
          error,
          this.page.updatePath(appointment, null, req.query, false),
        )
      }
    }
  }
}
