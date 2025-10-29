/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import ConfirmController from './confirmController'
import EnforcementController from './enforcementController'
import LogComplianceController from './logComplianceController'
import LogHoursController from './logHoursController'
import ProjectDetailsController from './projectDetailsController'

const controllers = (services: Services) => {
  const attendanceOutcomeController = new AttendanceOutcomeController(
    services.appointmentService,
    services.referenceDataService,
    services.appointmentFormService,
  )

  const enforcementController = new EnforcementController(
    services.appointmentService,
    services.referenceDataService,
    services.appointmentFormService,
  )

  const logComplianceController = new LogComplianceController(
    services.appointmentService,
    services.appointmentFormService,
  )

  const logHoursController = new LogHoursController(services.appointmentService, services.appointmentFormService)

  const projectDetailsController = new ProjectDetailsController(
    services.appointmentService,
    services.appointmentFormService,
    services.providerService,
  )

  const confirmController = new ConfirmController(services.appointmentService, services.appointmentFormService)

  return {
    attendanceOutcomeController,
    confirmController,
    enforcementController,
    logComplianceController,
    logHoursController,
    projectDetailsController,
  }
}

export default controllers
