import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'

export default class AppointmentsController extends BaseController<AppointmentPage> {
  constructor(page: AppointmentPage, courseCompletionService: CourseCompletionService) {
    super(page, courseCompletionService)
  }
}
