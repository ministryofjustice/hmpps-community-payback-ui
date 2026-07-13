import { Router } from 'express'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import { Controllers } from '../controllers'
import sessionRoutes from './session'
import appointmentRoutes from './appointment'
import projectRoutes from './project'
import courseCompletionRoutes from './courseCompletion'
import paths from '../paths'
import staticRoutes from './static'
import actions from './actions'
import peopleRoutes from './people'

export default function routes(controllers: Controllers, services: Services): Router {
  const router = Router()

  const { get } = actions(router)

  const { dashboardController, projectsController, dataController, staticController, personSearchController } =
    controllers

  get('/', dashboardController.index(), { auditEvent: Page.VIEW_INDEX_PAGE })
  get(paths.data.teams.pattern, dataController.teams())

  // Provide a route for client side error handling
  router.get(paths.error.pattern, async (_, res) => {
    res.status(500)
    return res.render('pages/500')
  })

  staticRoutes(staticController, router)

  peopleRoutes(personSearchController, services, router)
  appointmentRoutes(controllers, router)
  sessionRoutes(controllers, router)
  projectRoutes(projectsController, router)
  courseCompletionRoutes(controllers, router)

  return router
}
