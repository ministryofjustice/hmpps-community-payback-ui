import { Router } from 'express'
import paths from '../paths'
import AuditService, { Page } from '../services/auditService'
import ProjectsController from '../controllers/projectsController'

export default function projectRoutes(
  projectsController: ProjectsController,
  router: Router,
  auditService: AuditService,
): Router {
  router.get(paths.projects.show.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_SINGLE_PROJECT_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = projectsController.show()
    await handler(req, res, next)
  })

  return router
}
