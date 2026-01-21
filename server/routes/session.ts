import { Router } from 'express'
import SessionsController from '../controllers/sessionsController'
import paths from '../paths'
import AuditService, { Page } from '../services/auditService'

export default function sessionRoutes(
  sessionsController: SessionsController,
  router: Router,
  auditService: AuditService,
): Router {
  router.get('/sessions', async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_SESSIONS_SEARCH_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = sessionsController.index()
    await handler(req, res, next)
  })

  router.get('/sessions/search', async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_SESSIONS_SEARCH_PAGE_RESULTS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = sessionsController.search()
    await handler(req, res, next)
  })

  router.get(paths.sessions.show.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_SINGLE_SESSION_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = sessionsController.show()
    await handler(req, res, next)
  })

  return router
}
