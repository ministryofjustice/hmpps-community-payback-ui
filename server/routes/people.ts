import { Router } from 'express'
import { path } from 'static-path'
import paths from '../paths'
import type { Services } from '../services'
import actions from './actions'
import { Page } from '../services/auditService'
import requirementMiddleware from './requirementMiddleware'
import { Controllers } from '../controllers'

export default function peopleRoutes(controllers: Controllers, services: Services, router: Router): Router {
  const { get, post } = actions(router)
  const { personSearchController, requirementController } = controllers

  post(paths.people.find.pattern, services.personSearchService.post)
  get(
    paths.people.find.pattern,
    [
      services.personSearchService.get,
      (req, res, next) => {
        const resultPath = paths.people.requirement({
          crn: ':crn',
        })
        return personSearchController.show(Page.SEARCH_FIND_A_PERSON_RESULTS, resultPath)(req, res, next)
      },
    ],
    {
      auditEvent: Page.SEARCH_FIND_A_PERSON,
    },
  )

  // TODO: updatePath and the path for a single requirement will need
  //       plumbing in, to connect to the (currently unbuilt) view
  //       appointments page
  get(
    paths.people.requirement.pattern,
    [
      requirementMiddleware(services.offenderService, path('/')),
      (req, res, next) => {
        return requirementController.show({
          updatePath: '/',
          backPath: paths.people.find({}),
        })(req, res, next)
      },
    ],
    {
      auditEvent: Page.VIEW_FIND_A_PERSON_REQUIREMENT_PAGE,
    },
  )

  return router
}
