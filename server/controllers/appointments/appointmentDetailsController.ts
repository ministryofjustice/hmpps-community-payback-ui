import type { Request, RequestHandler, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService, { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import { AppointmentParams } from '../../@types/user-defined'
import ProjectService from '../../services/projectService'
import ReferenceDataService from '../../services/referenceDataService'
import config from '../../config'
import OffenderService from '../../services/offenderService'
import UnpaidWorkUtils from '../../utils/unpaidWorkUtils'

export default class AppointmentDetailsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentFormService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly offenderService: OffenderService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = _req.params as unknown as AppointmentParams
      const { username } = res.locals.user

      const [appointment, project, documents] = await Promise.all([
        this.appointmentService.getAppointment({ ...appointmentParams, username }),
        this.projectService.getProject({ username, projectCode: appointmentParams.projectCode }),
        config.featureFlags.documentUploadEnabled
          ? this.appointmentService.getDocuments(appointmentParams.appointmentId, username)
          : [],
      ])

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const [contactOutcome, unpaidWorkDetail] = await Promise.all([
        appointment.contactOutcomeCode
          ? this.referenceDataService.getContactOutcome(username, appointment.contactOutcomeCode)
          : undefined,
        config.featureFlags.displayHoursDetailsEnabled
          ? this.offenderService.getOffenderUnpaidWorkDetail({
              username,
              crn: appointment.offender.crn,
              deliusEventNumber: appointment.deliusEventNumber,
            })
          : undefined,
      ])

      const page = new CheckAppointmentDetailsPage()

      let formId = _req.query.form?.toString()
      let form: AppointmentOutcomeForm
      if (formId) {
        // A form might exist if user has navigated back to this page
        form = await this.appointmentFormService.getForm(formId, res.locals.user.username)
      } else {
        const { data, key } = await this.appointmentFormService.createUpdateAppointmentForm(
          appointment,
          project,
          res.locals.user.username,
          _req.query as Record<string, string>,
        )
        form = data
        formId = key.id
      }

      const unpaidWorkHoursItems =
        config.featureFlags.displayHoursDetailsEnabled && unpaidWorkDetail
          ? UnpaidWorkUtils.unpaidWorkHoursCardList(unpaidWorkDetail)
          : undefined

      res.render('appointments/update/appointmentDetails', {
        ...page.commonViewData({
          pathData: { ...appointmentParams, date: appointment.date },
          appointmentOrSession: { appointment },
          form,
          formId,
        }),
        ...page.viewData({
          appointment,
          project,
          contactOutcome,
          documents,
          formId,
          form,
          originalPath: _req.originalUrl,
        }),
        unpaidWorkHoursItems,
      })
    }
  }

  submitUpdate(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const appointmentParams = { ..._req.params } as unknown as AppointmentParams

      const page = new CheckAppointmentDetailsPage()

      const formId = _req.body.form?.toString()

      return res.redirect(page.next({ pathData: appointmentParams, formId }))
    }
  }
}
