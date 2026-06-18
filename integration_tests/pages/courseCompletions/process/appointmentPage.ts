import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import RadioOrCheckboxGroupComponent from '../../components/radioOrCheckboxGroupComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class AppointmentPage extends BaseCourseCompletionsPage {
  readonly appointmentOptions: RadioOrCheckboxGroupComponent

  constructor(title = 'Choose an appointment') {
    super(title)
    this.appointmentOptions = new RadioOrCheckboxGroupComponent('appointmentId')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'appointments', id: courseCompletion.id }), {
      form: '12',
    })
    return this.visitAndCheck(path, AppointmentPage.getName(courseCompletion))
  }

  selectAppointment(appointmentId: number) {
    this.appointmentOptions.checkOptionWithValue(appointmentId.toString())
  }

  clickCreateAppointment() {
    this.clickSubmit('Create an appointment')
  }

  shouldShowError() {
    this.shouldShowErrorSummary('appointmentId', 'Select an appointment or create a new one')
  }

  shouldOnlyShowCreateAppointmentButton() {
    cy.get('button').contains('Create an appointment').should('be.visible')
    cy.contains('button', 'Continue').should('not.exist')
  }

  shouldShowNoAppointments() {
    cy.get('p').contains('There are no existing appointments.').should('be.visible')
  }

  shouldShowAppointment(appointmentId: number) {
    this.appointmentOptions.shouldHaveSelectedValue(appointmentId.toString())
  }
}
