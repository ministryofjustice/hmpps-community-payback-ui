import { AppointmentDto, SessionDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import Page from '../page'

export default class BulkUpdatePage extends Page {
  private readonly checkBoxes: RadioOrCheckboxGroupComponent

  constructor(session: SessionDto) {
    super(`${session.projectName} (${DateTimeFormats.isoDateToUIDate(session.date)})`)
    this.checkBoxes = new RadioOrCheckboxGroupComponent('appointments')
  }

  shouldShowSelectedPeople(appointments: Array<Pick<AppointmentDto, 'id'>>) {
    const selectedValues = appointments.map(appointment => appointment.id.toString())
    selectedValues.forEach(id => this.checkBoxes.shouldHaveSelectedValue(id))
  }

  shouldShowNotSelectedPeople(appointments: Array<Pick<AppointmentDto, 'id'>>) {
    const selectedValues = appointments.map(appointment => appointment.id.toString())
    selectedValues.forEach(id => this.checkBoxes.shouldHaveUnselectedValue(id))
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select all people with the same attendance outcome')
  }
}
