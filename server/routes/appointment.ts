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
