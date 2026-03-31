import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import AppointmentService from '../../../services/appointmentService'

export default class AppointmentsController extends BaseController<AppointmentPage> {
  constructor(
    page: AppointmentPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly appointmentService: AppointmentService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ res, req, formData }: StepViewDataParams) {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const projectCode = this.getPropertyValue({ propertyName: 'project', req, formData })
    const appointmentId = this.getPropertyValue({ propertyName: 'appointmentIdToUpdate', req, formData })

    const appointments = await this.appointmentService.getAppointments(res.locals.user.username, {
      crn,
      projectTypeGroup: 'ETE',
      outcomeCodes: ['NO_OUTCOME'],
      projectCodes: [projectCode],
    })

    const appointmentOptions = this.page.getAppointmentOptions(appointments, appointmentId)

    return { appointmentOptions }
  }
}
