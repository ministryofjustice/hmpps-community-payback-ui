import { Router } from 'express'
import paths from '../paths'
import { actions } from './utils'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { AppointmentFormPage } from '../pages/appointments/pathMap'

export default function sessionRoutes(controllers: Controllers, router: Router): Router {
  const { get, post } = actions(router)
  const { sessionsController, appointments } = controllers

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.VIEW_SESSIONS })
  get(paths.sessions.show.pattern, sessionsController.show())

  get(paths.sessions.update.pattern, async (req, res, next) => {
    const page = req.params.page as AppointmentFormPage
    const controller = appointments.updateControllers[page]

    // There is no route for appointment details when handling multiples
    if (!controller || page === 'appointment-details') {
      return next()
    }

    const handler = controller.show()
    return handler(req, res, next)
  })

  post(paths.sessions.update.pattern, async (req, res, next) => {
    const page = req.params.page as AppointmentFormPage
    const controller = appointments.updateControllers[page]

    // There is no route for appointment details when handling multiples
    if (!controller || page === 'appointment-details') {
      return next()
    }

    const handler = controller.submit()
    return handler(req, res, next)
  })

  return router
}
