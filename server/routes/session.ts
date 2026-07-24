import { Router } from 'express'
import paths from '../paths'
import actions from './actions'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { APPOINTMENT_FORM_PAGES_AUDIT_MAP, AppointmentFormPage } from '../pages/appointments/pathMap'

const bulkUpdateAppointmentFormPages: Array<AppointmentFormPage> = [
  'choose-supervisor',
  'choose-project',
  'attendance-outcome',
  'log-hours',
  'log-compliance',
  'confirm-details',
]

export default function sessionRoutes(controllers: Controllers, router: Router): Router {
  const selectPeopleRoute = paths.sessions.update.pattern.replace(':page', 'select-people')

  const { get, post } = actions(router)
  const { sessionsController, appointments } = controllers

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.VIEW_SESSIONS })
  get(paths.sessions.show.pattern, sessionsController.show())

  get(selectPeopleRoute, appointments.bulkUpdateController.show(), {
    auditEvent: Page.VIEW_SESSIONS_SELECT_PEOPLE,
  })

  post(selectPeopleRoute, appointments.bulkUpdateController.submitUpdate(), {
    auditEvent: Page.EDIT_SESSIONS_SELECT_PEOPLE,
  })

  bulkUpdateAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = appointments.updateControllers[page]

    const { pattern } = paths.sessions.update
    const patternWithPage = pattern.replace(':page', page)

    get(patternWithPage, controller.show(), {
      auditEvent: `BULK_${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show}`,
    })

    post(patternWithPage, controller.submitUpdate(), {
      auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit}_BULK`,
    })
  })

  get(paths.sessions.createAppointment.pattern, appointments.appointmentsController.create())

  return router
}
