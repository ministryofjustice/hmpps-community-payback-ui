import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import sessionRoutes from './session'
import appointmentRoutes from './appointment'
import projectRoutes from './project'
import courseCompletionRoutes from './courseCompletion'
import paths from '../paths'

export default function routes(controllers: Controllers, { auditService }: Services): Router {
  const router = Router()

  const { dashboardController, sessionsController, projectsController, courseCompletionsController, dataController } =
    controllers

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.INDEX_PAGE, { who: res.locals.user.username, correlationId: req.id })

    const handler = dashboardController.index()
    await handler(req, res, next)
  })

  router.get(paths.data.teams.pattern, async (req, res, next) => {
    const handler = dataController.teams()
    await handler(req, res, next)
  })

  appointmentRoutes(controllers, router, auditService)
  sessionRoutes(sessionsController, router, auditService)
  projectRoutes(projectsController, router, auditService)
  courseCompletionRoutes(courseCompletionsController, router, auditService)

  return router
}
