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
import { AppointmentFormPage } from '../../pages/appointments/pathMap'
import { IFormPageController } from '../../@types/user-defined'

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
    services.projectService,
    services.referenceDataService,
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
    services.auditService,
    services.providerService,
    services.appointmentService,
    services.offenderService,
    services.referenceDataService,
    services.projectService,
  )

  const updateControllers: Record<AppointmentFormPage, IFormPageController> = {
    'choose-supervisor': chooseSupervisorController,
    'attendance-outcome': attendanceOutcomeController,
    'log-hours': logHoursController,
    'log-compliance': logComplianceController,
    'confirm-details': confirmController,
    'appointment-details': appointmentDetailsController,
  }

  return {
    updateControllers,
    adjustTravelTimeController,
  }
}

export default controllers
