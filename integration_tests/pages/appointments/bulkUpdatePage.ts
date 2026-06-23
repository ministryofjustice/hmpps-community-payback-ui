import { AppointmentDto, SessionDto } from '../../../server/@types/shared'
import { pathWithQuery } from '../../../server/utils/utils'
import paths from '../../../server/paths'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import Page from '../page'

export default class BulkUpdatePage extends Page {
  private readonly checkBoxes: RadioOrCheckboxGroupComponent

  constructor(session: SessionDto) {
    super(session.projectName)
    this.checkBoxes = new RadioOrCheckboxGroupComponent('appointments')
  }

  static visitForSession(session: SessionDto, formId?: string): BulkUpdatePage {
    const query = formId ? { form: formId } : undefined
    const path = pathWithQuery(
      paths.sessions.update({
        projectCode: session.projectCode,
        date: session.date,
        page: 'select-people',
      }),
      query,
    )

    return this.visitAndCheck(path, session)
  }

  selectPeople(appointments: Array<Pick<AppointmentDto, 'id'>>) {
    appointments.forEach(appointment => this.checkBoxes.checkOptionWithValue(appointment.id.toString()))
  }

  shouldShowSelectedPeople(appointments: Array<Pick<AppointmentDto, 'id'>>) {
    const selectedValues = appointments.map(appointment => appointment.id.toString())
    selectedValues.forEach(id => this.checkBoxes.shouldHaveSelectedValue(id))
  }

  shouldShowNotSelectedPeople(appointments: Array<Pick<AppointmentDto, 'id'>>) {
    const selectedValues = appointments.map(appointment => appointment.id.toString())
    selectedValues.forEach(id => this.checkBoxes.shouldHaveUnselectedValue(id))
  }

  shouldNotHaveAnySelectedPeople() {
    this.checkBoxes.shouldNotHaveASelectedValue()
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select all people with the same attendance outcome')
  }
}
