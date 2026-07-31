import { Router } from 'express'
import paths from '../paths'
import type { Services } from '../services'
import actions from './actions'
import PersonSearchController from '../controllers/personSearchController'
import { Page } from '../services/auditService'

export default function peopleRoutes(
  personSearchController: PersonSearchController,
  services: Services,
  router: Router,
): Router {
  const { get, post } = actions(router)

  post(paths.people.find.pattern, services.personSearchService.post)
  get(
    paths.people.find.pattern,
    [services.personSearchService.get, personSearchController.show(Page.SEARCH_FIND_A_PERSON_RESULTS)],
    {
      auditEvent: Page.SEARCH_FIND_A_PERSON,
    },
  )

  return router
}
