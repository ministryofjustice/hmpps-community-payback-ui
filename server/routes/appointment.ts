import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'
import { Page } from '../services/auditService'
import actions from './actions'
import { APPOINTMENT_FORM_PAGES_AUDIT_MAP, AppointmentFormPage } from '../pages/appointments/pathMap'
import featureFlagMiddleware from './featureFlagMiddleware'

const singleAppointmentFormPages: Array<AppointmentFormPage> = [
  'choose-supervisor',
  'choose-project',
  'attendance-outcome',
  'log-hours',
  'log-compliance',
  'confirm-details',
]

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const appointmentDetailsRoute = paths.appointments.update.pattern.replace(':page', 'appointment-details')
  const { appointments: { updateControllers, adjustTravelTimeController, appointmentDetailsController } = {} } =
    controllers

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

  get(appointmentDetailsRoute, appointmentDetailsController.show(), {
    auditEvent: Page.VIEW_APPOINTMENT,
  })

  post(appointmentDetailsRoute, appointmentDetailsController.submitUpdate(), {
    auditEvent: Page.EDIT_APPOINTMENT_DETAILS_PAGE,
  })

  singleAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = updateControllers[page]

    const createRoute = paths.appointments.create.pattern.replace(':page', page)

    get(createRoute, [featureFlagMiddleware('createAppointmentEnabled'), controller.create()], {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].create,
    })
    post(createRoute, [featureFlagMiddleware('createAppointmentEnabled'), controller.submitCreate()], {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submitCreate,
    })

    const updateRoute = paths.appointments.update.pattern.replace(':page', page)

    get(updateRoute, controller.show(), {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show,
    })

    post(updateRoute, controller.submitUpdate(), {
      auditEvent: APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit,
    })
  })

  return router
}
