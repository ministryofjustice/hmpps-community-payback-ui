import { Router } from 'express'
import paths from '../paths'
import { Page } from '../services/auditService'
import ProjectsController from '../controllers/projectsController'
import actions from './actions'

export default function projectRoutes(projectsController: ProjectsController, router: Router): Router {
  const { get } = actions(router)

  get(paths.projects.index.pattern, projectsController.index(), { auditEvent: Page.VIEW_PROJECTS_SEARCH_PAGE })
  get(paths.projects.show.pattern, projectsController.show())
  get(paths.projects.filter.pattern, projectsController.filter(), {
    auditEvent: Page.SEARCH_PROJECTS,
  })

  return router
}
