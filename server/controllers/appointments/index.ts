/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
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

  return {
    attendanceOutcomeController,
    logComplianceController,
    logHoursController,
    projectDetailsController,
  }
}

export default controllers
