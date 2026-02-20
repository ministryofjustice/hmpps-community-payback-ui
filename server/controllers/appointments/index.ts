/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import ConfirmController from './confirmController'
import LogComplianceController from './logComplianceController'
import LogHoursController from './logHoursController'
import AppointmentDetailsController from './appointmentDetailsController'

const controllers = (services: Services) => {
  const attendanceOutcomeController = new AttendanceOutcomeController(
    services.appointmentService,
    services.referenceDataService,
    services.appointmentFormService,
  )

  const logComplianceController = new LogComplianceController(
    services.appointmentService,
    services.appointmentFormService,
  )

  const logHoursController = new LogHoursController(services.appointmentService, services.appointmentFormService)

  const appointmentDetailsController = new AppointmentDetailsController(
    services.appointmentService,
    services.appointmentFormService,
    services.providerService,
    services.projectService,
  )

  const confirmController = new ConfirmController(
    services.appointmentService,
    services.appointmentFormService,
    services.projectService,
  )

  return {
    attendanceOutcomeController,
    confirmController,
    logComplianceController,
    logHoursController,
    appointmentDetailsController,
  }
}

export default controllers
