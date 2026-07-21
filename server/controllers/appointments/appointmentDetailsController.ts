import type { Request, RequestHandler, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentParams, AppointmentOutcomeForm } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import ReferenceDataService from '../../services/referenceDataService'

export default class AppointmentDetailsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = _req.params as unknown as AppointmentParams
      const appointment = await this.appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const project = await this.projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentParams.projectCode,
      })

      const contactOutcome = appointment.contactOutcomeCode
        ? await this.referenceDataService.getContactOutcome(res.locals.user.username, appointment.contactOutcomeCode)
        : undefined

      const page = new CheckAppointmentDetailsPage()

      let formId = _req.query.form?.toString()
      let form: AppointmentOutcomeForm
      if (formId) {
        // A form might exist if user has navigated back to this page
        form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createForm(
          appointment,
          project,
          res.locals.user.username,
          _req.query as Record<string, string>,
        )
        form = data
        formId = key.id
      }

      res.render('appointments/update/appointmentDetails', {
        ...page.commonViewData({
          pathData: { ...appointmentParams, date: appointment.date },
          appointmentOrSession: appointment,
          originalSearch: form.originalSearch,
          project,
          form: {} as AppointmentOutcomeForm,
          formId,
        }),
        ...page.viewData({ appointment, project, contactOutcome, formId }),
      })
    }
  }

  submit(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const page = new CheckAppointmentDetailsPage()

      const formId = _req.body.form?.toString()

      return res.redirect(page.next({ ...appointmentParams, formId }))
    }
  }
}
