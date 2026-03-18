import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class AppointmentPage extends BaseCourseCompletionsPage {
  constructor() {
    super('View pre-scheduled appointments')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = paths.courseCompletions.process({ page: 'appointments', id: courseCompletion.id })
    cy.visit(path)

    return new AppointmentPage()
  }
}
