import { Router, Request } from 'express'
import paths from '../paths'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { CourseCompletionPage } from '../pages/courseCompletions/process/pathMap'
import AppointmentsController from '../controllers/courseCompletions/process/appointmentsController'
import actions from './actions'
import { Services } from '../services'
import limitedOffenderMiddleware from './limitedOffenderMiddleware'
import requirementMiddleware from './requirementMiddleware'
import { pathWithQuery } from '../utils/utils'

export default function courseCompletionRoutes(controllers: Controllers, router: Router, services: Services): Router {
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
    paths.courseCompletions.createAppointment.pattern,
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

  post(paths.courseCompletions.process.pattern, [
    (req, res, next) => {
      const page = req.params.page as CourseCompletionPage

      if (page === 'crn') {
        return services.personSearchService.post.apply(this, [req, res, next])
      }
      const handler = processCourseCompletionsControllers[page].submit()

      return handler(req, res, next)
    },
  ])

  get(paths.courseCompletions.process.pattern, [
    (req, res, next) => {
      if (req.params.page === 'crn') {
        return services.personSearchService.get.apply(this, [req, res, next])
      }

      return next()
    },
    (req, res, next) => {
      const page = req.params.page as CourseCompletionPage

      const handler = processCourseCompletionsControllers[page].show()
      return handler(req, res, next)
    },
  ])

  get(paths.courseCompletions.checkCrn.pattern, [
    (req, res, next) => {
      const backPath = pathWithQuery(
        paths.courseCompletions.process({ id: req.params.id, page: 'crn' }),
        req.query as Record<string, string>,
        {
          encode: true,
        },
      )
      return limitedOffenderMiddleware({ offenderService: services.offenderService, backPath }).apply(this, [
        req,
        res,
        next,
      ])
    },
    requirementMiddleware(services.offenderService, paths.courseCompletions.process, {
      mode: 'checkHasMinimumOneRequirement',
      paramBuilder: (req: Request) => ({
        page: 'crn',
        id: req.params.id,
      }),
    }),
    (req, res, next) => {
      const handler = processCourseCompletionsControllers.crn.submit()
      return handler(req, res, next)
    },
  ])

  return router
}
