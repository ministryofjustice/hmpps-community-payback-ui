/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'
import SessionsController from './sessionsController'
import appointmentControllers from './appointments'
import ProjectsController from './projectsController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const projectsController = new ProjectsController()
  const sessionsController = new SessionsController(services.providerService, services.sessionService)

  return {
    dashboardController,
    projectsController,
    sessionsController,
    appointments: {
      ...appointmentControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
