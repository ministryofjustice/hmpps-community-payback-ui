import { Router } from 'express'
import paths from '../paths'
import type { Services } from '../services'
import { actions } from './utils'
import PersonSearchController from '../controllers/personSearchController'
import { Page } from '../services/auditService'

export default function peopleRoutes(
  personSearchController: PersonSearchController,
  services: Services,
  router: Router,
): Router {
  const { get, post } = actions(router)

  post(paths.people.session.find.pattern, services.personSearchService.post)
  get(paths.people.session.find.pattern, [services.personSearchService.get, personSearchController.show()], {
    auditEvent: Page.VIEW_SESSIONS_FIND_A_PERSON,
  })

  return router
}
