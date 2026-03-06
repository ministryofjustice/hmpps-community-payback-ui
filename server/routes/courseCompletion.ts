import { Router } from 'express'
import paths from '../paths'
import AuditService, { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { CourseCompletionPage } from '../pages/courseCompletions/process/pathMap'

export default function courseCompletionRoutes(
  controllers: Controllers,
  router: Router,
  auditService: AuditService,
): Router {
  const { courseCompletionsController, processCourseCompletionsController: processCourseCompletionsControllers } =
    controllers
  router.get(paths.courseCompletions.index.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_COURSE_COMPLETIONS_SEARCH_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = courseCompletionsController.index()
    await handler(req, res, next)
  })

  router.get(paths.courseCompletions.search.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_COURSE_COMPLETIONS_SEARCH_PAGE_RESULTS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = courseCompletionsController.search()
    await handler(req, res, next)
  })

  router.get(paths.courseCompletions.show.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_SINGLE_COMPLETION_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = courseCompletionsController.show()
    await handler(req, res, next)
  })

  router.get(paths.courseCompletions.process.pattern, async (req, res) => {
    const page = req.params.page as CourseCompletionPage

    const handler = processCourseCompletionsControllers[page].show()
    await handler(req, res)
  })

  router.post(paths.courseCompletions.process.pattern, async (req, res) => {
    const page = req.params.page as CourseCompletionPage

    const handler = processCourseCompletionsControllers[page].submit()
    await handler(req, res)
  })

  return router
}
