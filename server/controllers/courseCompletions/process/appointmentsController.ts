import { Request, RequestHandler, Response } from 'express'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import AppointmentService from '../../../services/appointmentService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import paths from '../../../paths'
import { pathWithQuery } from '../../../utils/utils'

export default class AppointmentsController extends BaseController<AppointmentPage> {
  constructor(
    page: AppointmentPage,
    courseCompletionService: CourseCompletionService,
    private readonly formService: CourseCompletionFormService,
    private readonly appointmentService: AppointmentService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ res, req, formData, formId, courseCompletion }: StepViewDataParams) {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const projectCode = this.getPropertyValue({ propertyName: 'project', req, formData })
    const appointmentId = this.getPropertyValue({ propertyName: 'appointmentIdToUpdate', req, formData })

    const appointments = await this.appointmentService.getAppointments(res.locals.user.username, {
      crn,
      projectTypeGroup: 'ETE',
      outcomeCodes: ['NO_OUTCOME'],
      projectCodes: [projectCode],
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    })

    const appointmentOptions = this.page.getAppointmentOptions(appointments, appointmentId)

    return {
      appointmentOptions,
      createNewAppointmentPath: pathWithQuery(paths.appointments.create({ id: courseCompletion.id }), { form: formId }),
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params

      const { formId, formData } = await this.getForm(req, res)

      this.formService.saveForm(formId, res.locals.user.username, {
        ...formData,
        appointmentIdToUpdate: undefined,
        timeToCredit: undefined,
        'date-day': undefined,
        'date-month': undefined,
        'date-year': undefined,
      })

      return res.redirect(pathWithQuery(paths.courseCompletions.process({ id, page: 'outcome' }), { form: formId }))
    }
  }
}
