/* istanbul ignore file */

import type { Router } from 'express'

import paths from '../paths/static'
import StaticController from '../controllers/staticController'
import AuditService, { Page } from '../services/auditService'

export default function staticRoutes(
  staticController: StaticController,
  router: Router,
  auditService: AuditService,
): Router {
  router.get(paths.static.cookiesPolicy.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.COOKIES_POLICY_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = staticController.cookiesPolicyPage()
    await handler(req, res, next)
  })

  return router
}
