import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class AppointmentsController extends BaseController<AppointmentPage> {
  constructor(
    page: AppointmentPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }
}
