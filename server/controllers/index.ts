/* istanbul ignore file */

import { Services } from '../services'
import DashboardController from './dashboardController'
import SessionsController from './sessionsController'
import appointmentControllers from './appointments'
import ProjectsController from './projectsController'
import CourseCompletionsController from './courseCompletions'
import DataController from './dataController'
import StaticController from './staticController'
import courseCompletionsControllers from './courseCompletions/process'
import PeopleController from './peopleController'
import RequirementController from './requirementController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const projectsController = new ProjectsController(
    services.auditService,
    services.providerService,
    services.projectService,
    services.appointmentService,
  )
  const sessionsController = new SessionsController(
    services.auditService,
    services.providerService,
    services.sessionService,
    services.referenceDataService,
  )

  const courseCompletionsController = new CourseCompletionsController(
    services.auditService,
    services.courseCompletionService,
    services.providerService,
    services.referenceDataService,
    services.courseCompletionFormService,
  )
  const dataController = new DataController(services.providerService)
  const staticController = new StaticController()
  const peopleController = new PeopleController(services.auditService, services.appointmentFormService)
  const requirementController = new RequirementController(services.appointmentFormService, services.offenderService)

  return {
    dashboardController,
    projectsController,
    sessionsController,
    courseCompletionsController,
    processCourseCompletionsController: courseCompletionsControllers(services),
    appointments: {
      ...appointmentControllers(services),
    },
    dataController,
    staticController,
    peopleController,
    requirementController,
  }
}

export type Controllers = ReturnType<typeof controllers>
