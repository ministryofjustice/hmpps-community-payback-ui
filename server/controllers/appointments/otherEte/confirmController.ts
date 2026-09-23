import type { Request, RequestHandler, Response, NextFunction } from 'express'
import { CreateAppointmentDto } from '../../../@types/shared'
import { IFormPageController } from '../../../@types/user-defined'
import paths from '../../../paths'
import PageWithValidation from '../../../pages/pageWithValidation'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'
import ConfirmPage, { ConfirmPageBody } from '../../../pages/appointments/otherEte/confirmPage'
import RecordActivityFormService from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import AppointmentService from '../../../services/appointmentService'
import AppointmentUtils from '../../../utils/appointmentUtils'
import NotesUtils from '../../../utils/components/notesUtils'
import { catchApiValidationErrorOrPropagate, ErrorViewData } from '../../../utils/errorUtils'
import { originalPathOr } from '../../../utils/utils'

export default class ConfirmController implements IFormPageController {
  constructor(
    private readonly formService: RecordActivityFormService,
    private readonly offenderService: OffenderService,
    private readonly appointmentService: AppointmentService,
  ) {}

  show(validationResults?: ErrorViewData<ConfirmPageBody>): RequestHandler {
    return async (req: Request, res: Response) => {
      const formId = req.query.form?.toString()
      const { username } = res.locals.user

      const form = await this.formService.getForm(formId, username)
      const offenderSummary = await this.offenderService.getOffenderSummary({ username, crn: form.crn })

      res.locals.audit = { subjectType: 'CRN', subjectId: form.crn }

      return res.render('appointments/update/confirm', {
        heading: AppointmentUtils.appointmentHeading(offenderSummary.offender, form.projectTypeGroup),
        backLink: buildOtherEtePath('compliance', formId),
        updatePath: buildOtherEtePath('confirm', formId),
        form: formId,
        submittedItems: ConfirmPage.formItems(form, formId),
        ...ConfirmPage.alertQuestionDetails(form),
        errors: validationResults?.errors ?? {},
        errorSummary: validationResults?.errorSummary,
      })
    }
  }

  submitUpdate(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const formId = req.query.form?.toString()
      const { username } = res.locals.user

      const validationResults = PageWithValidation.validate<ConfirmPageBody, unknown>(req.body, ConfirmPage.validate)

      if (validationResults.hasErrors) {
        return this.show(validationResults)(req, res, next)
      }

      const form = await this.formService.getForm(formId, username)

      const payload: CreateAppointmentDto = {
        crn: form.crn,
        deliusEventNumber: Number(form.deliusEventNumber),
        projectCode: form.project.code,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        contactOutcomeCode: form.contactOutcome.code,
        attendanceData: form.attendanceData,
        alertActive: ConfirmPage.isAlertSelected(req.body),
        ...NotesUtils.requestBody(form),
      }

      try {
        await this.appointmentService.createAppointment(payload, username)

        res.locals.audit = {
          subjectType: 'CRN',
          subjectId: form.crn,
        }

        req.flash('success', 'Attendance recorded')

        return res.redirect(
          originalPathOr(
            form,
            paths.people.appointments({
              crn: form.crn,
              deliusEventNumber: form.deliusEventNumber,
              appointmentSection: 'upcoming',
            }),
          ),
        )
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, buildOtherEtePath('confirm', formId))
      }
    }
  }
}
