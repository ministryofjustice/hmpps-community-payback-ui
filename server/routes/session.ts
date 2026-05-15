import { Router } from 'express'
import SessionsController from '../controllers/sessionsController'
import paths from '../paths'
import { actions } from './utils'
import { Page } from '../services/auditService'

export default function sessionRoutes(sessionsController: SessionsController, router: Router): Router {
  const { get } = actions(router)

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.VIEW_SESSIONS })
  get(paths.sessions.show.pattern, sessionsController.show())

  return router
}
