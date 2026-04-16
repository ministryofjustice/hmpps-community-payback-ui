import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import AppointmentsController from './appointmentsController'
import ConfirmController from './confirmController'
import CrnController from './crnController'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import HistoryController from './historyController'
import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import OutcomeController from './outcomeController'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import ProjectController from './projectController'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import RequirementController from './requirementController'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import PersonController from './personController'
import { CourseCompletionPage } from '../../../pages/courseCompletions/process/pathMap'
import BaseController from './baseController'
import { Services } from '../../../services'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import BaseCourseCompletionFormPage from '../../../pages/courseCompletions/process/baseCourseCompletionFormPage'

const controllers = (services: Services) => {
  const {
    courseCompletionService,
    courseCompletionFormService,
    appointmentService,
    providerService,
    projectService,
    offenderService,
  } = services
  const appointmentsController = new AppointmentsController(
    new AppointmentPage(),
    courseCompletionService,
    courseCompletionFormService,
    appointmentService,
  )
  const confirmController = new ConfirmController(
    new ConfirmPage(),
    courseCompletionService,
    courseCompletionFormService,
    providerService,
    projectService,
    offenderService,
    appointmentService,
  )
  const crnController = new CrnController(new CrnPage(), courseCompletionService, courseCompletionFormService)
  const personController = new PersonController(
    new PersonPage(),
    courseCompletionService,
    courseCompletionFormService,
    offenderService,
  )
  const historyController = new HistoryController(
    new HistoryPage(),
    courseCompletionService,
    courseCompletionFormService,
    appointmentService,
  )
  const outcomeController = new OutcomeController(
    new OutcomePage(),
    courseCompletionService,
    courseCompletionFormService,
    offenderService,
  )
  const projectController = new ProjectController(
    new ProjectPage(),
    courseCompletionService,
    courseCompletionFormService,
    providerService,
    projectService,
  )
  const requirementController = new RequirementController(
    new RequirementPage(),
    courseCompletionService,
    courseCompletionFormService,
    offenderService,
  )

  const group: Record<CourseCompletionPage, BaseController<BaseCourseCompletionFormPage<unknown>>> = {
    appointments: appointmentsController,
    confirm: confirmController,
    crn: crnController,
    person: personController,
    history: historyController,
    outcome: outcomeController,
    project: projectController,
    requirement: requirementController,
  }

  return group
}

export default controllers
