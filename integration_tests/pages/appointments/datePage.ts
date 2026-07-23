import BaseAppointmentFormPage, { AppointmentTitleContext } from './baseAppointmentFormPage'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'

export default class DatePage extends BaseAppointmentFormPage {
  protected override page: AppointmentFormPage = 'date'

  constructor(context: AppointmentTitleContext) {
    super(context)
  }

  protected override customCheckOnPage(): void {
    cy.get('label').should('contain.text', 'Add date')
  }

  clearDate() {
    cy.get('#date').clear()
  }

  enterDate(date: string): void {
    this.clearDate()
    cy.get('#date').type(date)
  }

  shouldHaveValue(date: string): void {
    cy.get('#date').should('have.value', date)
  }
}
