import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import RadioGroupComponent from '../../components/radioGroupComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class AppointmentPage extends BaseCourseCompletionsPage {
  readonly appointmentOptions: RadioGroupComponent

  constructor() {
    super('Connect an appointment')
    this.appointmentOptions = new RadioGroupComponent('appointmentId')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'appointments', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new AppointmentPage()
  }

  selectAppointment(appointmentId: number) {
    this.appointmentOptions.checkOptionWithValue(appointmentId.toString())
  }

  clickCreateNewAppointment() {
    cy.get('a').contains('Create an appointment').click()
  }

  shouldShowErrors() {
    this.shouldShowErrorSummary('appointmentId', 'Select an appointment or create a new one')
  }
}
