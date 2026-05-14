import { Router } from 'express'
import paths from '../paths'
import { Page } from '../services/auditService'
import ProjectsController from '../controllers/projectsController'
import { actions } from './utils'

export default function projectRoutes(projectsController: ProjectsController, router: Router): Router {
  const { get } = actions(router)

  get(paths.projects.index.pattern, projectsController.index(), { auditEvent: Page.SHOW_PROJECTS_SEARCH_PAGE })
  get(paths.projects.show.pattern, projectsController.show(), { auditEvent: Page.SHOW_SINGLE_PROJECT_PAGE })
  get(paths.projects.filter.pattern, projectsController.filter(), {
    auditEvent: Page.SHOW_PROJECTS_SEARCH_PAGE_RESULTS,
  })

  return router
}
