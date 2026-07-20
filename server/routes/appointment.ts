import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'
import { Page } from '../services/auditService'
import actions from './actions'
import { APPOINTMENT_FORM_PAGES_AUDIT_MAP, AppointmentFormPage } from '../pages/appointments/pathMap'

const singleAppointmentFormPages: Array<AppointmentFormPage> = [
  'choose-supervisor',
  'choose-project',
  'attendance-outcome',
  'log-hours',
  'log-compliance',
  'confirm-details',
  'appointment-details',
]

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const { appointments: { updateControllers, adjustTravelTimeController } = {} } = controllers

  const { get, post } = actions(router)

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

  singleAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = updateControllers[page]

    const { pattern } = paths.appointments.update
    const patternWithPage = pattern.replace(':page', page)

    get(patternWithPage, controller.show(), {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show,
    })

    post(patternWithPage, controller.submitUpdate(), {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit,
    })
  })

  return router
}
