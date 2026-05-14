import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'
import { Page } from '../services/auditService'
import { actions } from './utils'

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const {
    appointments: {
      attendanceOutcomeController,
      logComplianceController,
      logHoursController,
      appointmentDetailsController,
      chooseSupervisorController,
      confirmController,
      adjustTravelTimeController,
    } = {},
  } = controllers

  const { get, post } = actions(router)

  get(paths.appointments.appointmentDetails.pattern, appointmentDetailsController.show(), {
    auditEvent: Page.VIEW_APPOINTMENT,
  })
  post(paths.appointments.appointmentDetails.pattern, appointmentDetailsController.submit(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_DETAILS_PAGE,
  })

  get(paths.appointments.chooseSupervisor.pattern, chooseSupervisorController.show(), {
    auditEvent: Page.SHOW_CHOOSE_SUPERVISOR_PAGE,
  })
  post(paths.appointments.chooseSupervisor.pattern, chooseSupervisorController.submit(), {
    auditEvent: Page.SUBMIT_CHOOSE_SUPERVISOR_PAGE,
  })

  get(paths.appointments.attendanceOutcome.pattern, attendanceOutcomeController.show(), {
    auditEvent: Page.SHOW_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  })
  post(paths.appointments.attendanceOutcome.pattern, attendanceOutcomeController.submit(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  })

  get(paths.appointments.logHours.pattern, logHoursController.show(), {
    auditEvent: Page.SHOW_APPOINTMENT_LOG_HOURS_PAGE,
  })
  post(paths.appointments.logHours.pattern, logHoursController.submit(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_LOG_HOURS_PAGE,
  })

  get(paths.appointments.logCompliance.pattern, logComplianceController.show(), {
    auditEvent: Page.SHOW_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  })
  post(paths.appointments.logCompliance.pattern, logComplianceController.submit(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  })

  get(paths.appointments.confirm.pattern, confirmController.show(), { auditEvent: Page.SHOW_APPOINTMENT_CONFIRM_PAGE })
  post(paths.appointments.confirm.pattern, confirmController.submit(), {
    auditEvent: Page.EDIT_APPOINTMENT,
  })

  get(paths.appointments.travelTime.index.pattern, adjustTravelTimeController.index(), {
    auditEvent: Page.SHOW_APPOINTMENT_TRAVEL_TIME_SEARCH_PAGE,
  })
  get(paths.appointments.travelTime.filter.pattern, adjustTravelTimeController.filter(), {
    auditEvent: Page.SHOW_APPOINTMENT_TRAVEL_TIME_SEARCH_PAGE_RESULTS,
  })
  get(paths.appointments.travelTime.update.pattern, adjustTravelTimeController.update(), {
    auditEvent: Page.SHOW_APPOINTMENT_ADJUST_TRAVEL_TIME_PAGE,
  })
  post(paths.appointments.travelTime.update.pattern, adjustTravelTimeController.submitUpdate(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_ADJUST_TRAVEL_TIME_PAGE,
  })
  post(paths.appointments.travelTime.complete.pattern, adjustTravelTimeController.completeTask(), {
    auditEvent: Page.SUBMIT_APPOINTMENT_COMPLETE_TASK,
  })

  return router
}
