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
  'select-people',
]

export default function sessionRoutes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)
  const { sessionsController, appointments } = controllers

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.VIEW_SESSIONS })
  get(paths.sessions.show.pattern, sessionsController.show())

  bulkUpdateAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = appointments.updateControllers[page]

    const { pattern } = paths.sessions.update
    const patternWithPage = pattern.replace(':page', page)

    get(patternWithPage, controller.show(), {
      auditEvent: `BULK_${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show}`,
    })

    post(patternWithPage, controller.submit(), {
      auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit}_BULK`,
    })
  })

  return router
}
