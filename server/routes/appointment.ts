import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'
import { Page } from '../services/auditService'
import { actions } from './utils'
import { AppointmentFormPage } from '../pages/appointments/pathMap'

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const { appointments: { updateControllers, adjustTravelTimeController } = {} } = controllers

  const { get, post } = actions(router)

  get(paths.appointments.update.pattern, async (req, res, next) => {
    const page = req.params.page as AppointmentFormPage
    const controller = updateControllers[page]

    if (!controller) {
      return next()
    }

    const handler = controller.show()
    return handler(req, res, next)
  })

  post(paths.appointments.update.pattern, async (req, res, next) => {
    const page = req.params.page as AppointmentFormPage
    const controller = updateControllers[page]

    if (!controller) {
      return next()
    }

    const handler = controller.submit()
    return handler(req, res, next)
  })

  get(paths.appointments.appointmentDetails.pattern, updateControllers['appointment-details'].show(), {
    auditEvent: Page.VIEW_APPOINTMENT,
  })
  post(paths.appointments.appointmentDetails.pattern, updateControllers['appointment-details'].submit(), {
    auditEvent: Page.EDIT_APPOINTMENT_DETAILS_PAGE,
  })

  get(paths.appointments.chooseSupervisor.pattern, updateControllers['choose-supervisor'].show(), {
    auditEvent: Page.VIEW_CHOOSE_SUPERVISOR_PAGE,
  })
  post(paths.appointments.chooseSupervisor.pattern, updateControllers['choose-supervisor'].submit(), {
    auditEvent: Page.EDIT_CHOOSE_SUPERVISOR_PAGE,
  })

  get(paths.appointments.attendanceOutcome.pattern, updateControllers['attendance-outcome'].show(), {
    auditEvent: Page.VIEW_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  })
  post(paths.appointments.attendanceOutcome.pattern, updateControllers['attendance-outcome'].submit(), {
    auditEvent: Page.EDIT_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE,
  })

  get(paths.appointments.logHours.pattern, updateControllers['log-hours'].show(), {
    auditEvent: Page.VIEW_APPOINTMENT_LOG_HOURS_PAGE,
  })
  post(paths.appointments.logHours.pattern, updateControllers['log-hours'].submit(), {
    auditEvent: Page.EDIT_APPOINTMENT_LOG_HOURS_PAGE,
  })

  get(paths.appointments.logCompliance.pattern, updateControllers['log-compliance'].show(), {
    auditEvent: Page.VIEW_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  })
  post(paths.appointments.logCompliance.pattern, updateControllers['log-compliance'].submit(), {
    auditEvent: Page.EDIT_APPOINTMENT_LOG_COMPLIANCE_PAGE,
  })

  get(paths.appointments.confirm.pattern, updateControllers['confirm-details'].show(), {
    auditEvent: Page.VIEW_APPOINTMENT_CONFIRM_PAGE,
  })
  post(paths.appointments.confirm.pattern, updateControllers['confirm-details'].submit(), {
    auditEvent: Page.EDIT_APPOINTMENT,
  })

  get(paths.appointments.travelTime.index.pattern, adjustTravelTimeController.index(), {
    auditEvent: Page.SEARCH_TRAVEL_TIME_TASKS,
  })
  get(paths.appointments.travelTime.filter.pattern, adjustTravelTimeController.filter())
  get(paths.appointments.travelTime.update.pattern, adjustTravelTimeController.update(), {
    auditEvent: Page.VIEW_APPOINTMENT_DETAILS_TRAVEL_TIME,
  })
  post(paths.appointments.travelTime.update.pattern, adjustTravelTimeController.submitUpdate(), {
    auditEvent: Page.CREATE_ADJUSTMENT,
  })
  post(paths.appointments.travelTime.complete.pattern, adjustTravelTimeController.completeTask(), {
    auditEvent: Page.EDIT_TRAVEL_TIME_TASK_NOT_ELIGIBLE,
  })

  return router
}
