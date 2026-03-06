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
  const { courseCompletionService } = services
  const appointmentsController = new AppointmentsController(new AppointmentPage(), courseCompletionService)
  const confirmController = new ConfirmController(new ConfirmPage(), courseCompletionService)
  const crnController = new CrnController(new CrnPage(), courseCompletionService)
  const personController = new PersonController(new PersonPage(), courseCompletionService)
  const historyController = new HistoryController(new HistoryPage(), courseCompletionService)
  const outcomeController = new OutcomeController(new OutcomePage(), courseCompletionService)
  const projectController = new ProjectController(new ProjectPage(), courseCompletionService)
  const requirementController = new RequirementController(new RequirementPage(), courseCompletionService)

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
