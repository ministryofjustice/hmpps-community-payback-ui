/* istanbul ignore file */

import type { Router } from 'express'

import paths from '../paths/static'
import StaticController from '../controllers/staticController'
import { Page } from '../services/auditService'
import { actions } from './utils'

export default function staticRoutes(staticController: StaticController, router: Router): Router {
  const { get } = actions(router)

  get(paths.static.cookiesPolicy.pattern, staticController.cookiesPolicyPage(), {
    auditEvent: Page.COOKIES_POLICY_PAGE,
  })

  return router
}
