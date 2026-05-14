import { Router } from 'express'
import SessionsController from '../controllers/sessionsController'
import paths from '../paths'
import { actions } from './utils'
import { Page } from '../services/auditService'

export default function sessionRoutes(sessionsController: SessionsController, router: Router): Router {
  const { get } = actions(router)

  get('/sessions', sessionsController.index(), { auditEvent: Page.SHOW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search(), { auditEvent: Page.SHOW_SESSIONS_SEARCH_PAGE_RESULTS })
  get(paths.sessions.show.pattern, sessionsController.show(), { auditEvent: Page.SHOW_SINGLE_SESSION_PAGE })

  return router
}
