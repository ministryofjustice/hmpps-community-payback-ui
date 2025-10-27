/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import ConfirmController from './confirmController'
import LogComplianceController from './logComplianceController'
import LogHoursController from './logHoursController'
import ProjectDetailsController from './projectDetailsController'

const controllers = (services: Services) => {
  const attendanceOutcomeController = new AttendanceOutcomeController(
    services.appointmentService,
    services.referenceDataService,
  )

  const logComplianceController = new LogComplianceController(services.appointmentService)

  const logHoursController = new LogHoursController(services.appointmentService)

  const projectDetailsController = new ProjectDetailsController(services.appointmentService, services.providerService)

  const confirmController = new ConfirmController(services.appointmentService)

  return {
    attendanceOutcomeController,
    confirmController,
    logComplianceController,
    logHoursController,
    projectDetailsController,
  }
}

export default controllers
