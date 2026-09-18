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

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: req.params.id,
      })

      const { formId, formData } = await this.getForm(req, res)

      const viewData = {
        ...this.page.viewData(courseCompletion, formId, this.getOriginalSearch(req, formData)),
        ...(await this.getStepViewData({ req, res, courseCompletion, formData, formId, errors: {} })),
      }

      if (viewData.appointmentOptions.length) {
        return res.render(this.page.templatePath, viewData)
      }
      if (req.query.backQuery === 'fromOutcome') {
        return res.redirect(
          pathWithQuery(paths.courseCompletions.process({ id: req.params.id, page: 'project' }), { form: formId }),
        )
      }

      await this.createAppointment(req, res)

      return res.redirect(
        pathWithQuery(paths.courseCompletions.process({ id: req.params.id, page: 'outcome' }), { form: formId }),
      )
    }
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
      createNewAppointmentPath: pathWithQuery(paths.courseCompletions.createAppointment({ id: courseCompletion.id }), {
        form: formId,
      }),
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params

      const { formId } = await this.getForm(req, res)

      await this.createAppointment(req, res)

      return res.redirect(pathWithQuery(paths.courseCompletions.process({ id, page: 'outcome' }), { form: formId }))
    }
  }

  private async createAppointment(req: Request, res: Response) {
    const { formId, formData } = await this.getForm(req, res)

    this.formService.saveForm(formId, res.locals.user.username, {
      ...formData,
      appointmentIdToUpdate: undefined,
      timeToCredit: undefined,
      'date-day': undefined,
      'date-month': undefined,
      'date-year': undefined,
    })
  }
}
