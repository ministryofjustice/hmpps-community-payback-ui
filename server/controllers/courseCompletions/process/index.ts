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
import ConfirmCrnController from './confirmCrnController'
import ConfirmCrnPage from '../../../pages/courseCompletions/process/confirmCrnPage'
import { CourseCompletionPage } from '../../../pages/courseCompletions/process/pathMap'
import BaseController from './baseController'
import { Services } from '../../../services'

const controllers = (services: Services) => {
  const { courseCompletionService } = services
  const appointmentsController = new AppointmentsController(new AppointmentPage(), courseCompletionService)
  const confirmController = new ConfirmController(new ConfirmPage(), courseCompletionService)
  const crnController = new CrnController(new CrnPage(), courseCompletionService)
  const confirmCrnController = new ConfirmCrnController(new ConfirmCrnPage(), courseCompletionService)
  const historyController = new HistoryController(new HistoryPage(), courseCompletionService)
  const outcomeController = new OutcomeController(new OutcomePage(), courseCompletionService)
  const projectController = new ProjectController(new ProjectPage(), courseCompletionService)
  const requirementController = new RequirementController(new RequirementPage(), courseCompletionService)

  const group: Record<CourseCompletionPage, BaseController> = {
    appointments: appointmentsController,
    confirm: confirmController,
    crn: crnController,
    confirmCrn: confirmCrnController,
    history: historyController,
    outcome: outcomeController,
    project: projectController,
    requirement: requirementController,
  }

  return group
}

export default controllers
