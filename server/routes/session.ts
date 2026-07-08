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
  'select-people',
]

export default function sessionRoutes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)
  const { sessionsController, appointments } = controllers
  const confirmUpdateRoute = paths.sessions.update.pattern.replace(':page', 'confirm-details')

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.VIEW_SESSIONS })
  get(paths.sessions.show.pattern, sessionsController.show())

  bulkUpdateAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = appointments.updateControllers[page]

    const { pattern } = paths.sessions.update
    const patternWithPage = pattern.replace(':page', page)

    get(patternWithPage, controller.showSession(), {
      auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show}_BULK`,
    })

    post(patternWithPage, controller.submit(), {
      auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit}_BULK`,
    })
  })

  get(confirmUpdateRoute, appointments.updateControllers['confirm-details'].showSession(), {
    auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP['confirm-details'].show}_BULK`,
  })

  post(confirmUpdateRoute, appointments.updateControllers['confirm-details'].submitSession(), {
    auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP['confirm-details'].submit}_BULK`,
  })

  return router
}
