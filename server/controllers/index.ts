/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'
import SessionsController from './sessionsController'
import appointmentControllers from './appointments'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const sessionsController = new SessionsController(services.providerService, services.sessionService)

  return {
    dashboardController,
    sessionsController,
    appointments: {
      ...appointmentControllers(services),
    },
  }
}

export type Controllers = ReturnType<typeof controllers>
