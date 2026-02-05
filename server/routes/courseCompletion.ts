import { Router } from 'express'
import paths from '../paths'
import AuditService, { Page } from '../services/auditService'
import CourseCompletionsController from '../controllers/courseCompletionsController'

export default function courseCompletionRoutes(
  courseCompletionsController: CourseCompletionsController,
  router: Router,
  auditService: AuditService,
): Router {
  router.get(paths.courseCompletions.index.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_COURSE_COMPLETIONS_SEARCH_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = courseCompletionsController.index()
    await handler(req, res, next)
  })

  return router
}
