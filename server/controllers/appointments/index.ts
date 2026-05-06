/* istanbul ignore file */

import type { Services } from '../../services'
import AttendanceOutcomeController from './attendanceOutcomeController'
import ConfirmController from './confirmController'
import LogComplianceController from './logComplianceController'
import LogHoursController from './logHoursController'
import AppointmentDetailsController from './appointmentDetailsController'
import AdjustTravelTimeController from './adjustTravelTimeController'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import ChooseSupervisorController from './chooseSupervisorController'

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

  const chooseSupervisorController = new ChooseSupervisorController(
    services.appointmentService,
    services.appointmentFormService,
    services.providerService,
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
    services.offenderService,
    services.referenceDataService,
    services.projectService,
  )

  return {
    attendanceOutcomeController,
    confirmController,
    logComplianceController,
    logHoursController,
    appointmentDetailsController,
    chooseSupervisorController,
    adjustTravelTimeController,
  }
}

export default controllers
