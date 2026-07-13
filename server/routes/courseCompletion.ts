import { Router } from 'express'
import paths from '../paths'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { CourseCompletionPage } from '../pages/courseCompletions/process/pathMap'
import AppointmentsController from '../controllers/courseCompletions/process/appointmentsController'
import actions from './actions'

export default function courseCompletionRoutes(controllers: Controllers, router: Router): Router {
  const { courseCompletionsController, processCourseCompletionsController: processCourseCompletionsControllers } =
    controllers

  const { get, post } = actions(router)

  get(paths.courseCompletions.index.pattern, courseCompletionsController.index(), {
    auditEvent: Page.VIEW_COURSE_COMPLETION_FILTER,
  })
  get(paths.courseCompletions.search.pattern, courseCompletionsController.search())
  get(paths.courseCompletions.show.pattern, courseCompletionsController.show(), {
    auditEvent: Page.VIEW_COURSE_COMPLETION,
  })
  post(
    paths.appointments.create.pattern,
    (processCourseCompletionsControllers.appointments as AppointmentsController).create(),
  )
  get(
    paths.courseCompletions.unableToCreditTime.pattern,
    processCourseCompletionsControllers.unableToCreditTime.show(),
    { auditEvent: Page.VIEW_COURSE_COMPLETIONS_UNABLE_TO_CREDIT_TIME_PAGE },
  )
  post(
    paths.courseCompletions.unableToCreditTime.pattern,
    processCourseCompletionsControllers.unableToCreditTime.submit(),
    { auditEvent: Page.EDIT_COURSE_COMPLETIONS_UNABLE_TO_CREDIT_TIME_PAGE },
  )

  router.get(paths.courseCompletions.process.pattern, async (req, res, next) => {
    const page = req.params.page as CourseCompletionPage

    const handler = processCourseCompletionsControllers[page].show()
    await handler(req, res, next)
  })

  router.post(paths.courseCompletions.process.pattern, async (req, res, next) => {
    const page = req.params.page as CourseCompletionPage

    const handler = processCourseCompletionsControllers[page].submit()
    await handler(req, res, next)
  })

  return router
}
