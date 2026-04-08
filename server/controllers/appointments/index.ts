/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import ConfirmController from './confirmController'
import LogComplianceController from './logComplianceController'
import LogHoursController from './logHoursController'
import AppointmentDetailsController from './appointmentDetailsController'
import AdjustTravelTimeController from './adjustTravelTimeController'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'

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

  const adjustTravelTimeController = new AdjustTravelTimeController(
    new UpdateTravelTimePage(),
    services.providerService,
    services.appointmentService,
  )

  return {
    attendanceOutcomeController,
    confirmController,
    logComplianceController,
    logHoursController,
    appointmentDetailsController,
    adjustTravelTimeController,
  }
}

export default controllers
