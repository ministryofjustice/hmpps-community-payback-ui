/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'
import SessionsController from './sessionsController'
import appointmentControllers from './appointments'
import ProjectsController from './projectsController'
import CourseCompletionsController from './courseCompletionsController'
import DataController from './dataController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const projectsController = new ProjectsController(
    services.providerService,
    services.projectService,
    services.appointmentService,
  )
  const sessionsController = new SessionsController(services.providerService, services.sessionService)
  const courseCompletionsController = new CourseCompletionsController(services.courseCompletionService)
  const dataController = new DataController(services.providerService)

  return {
    dashboardController,
    projectsController,
    sessionsController,
    courseCompletionsController,
    appointments: {
      ...appointmentControllers(services),
    },
    dataController,
  }
}

export type Controllers = ReturnType<typeof controllers>
