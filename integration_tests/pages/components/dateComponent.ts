import { StructuredDate } from '../../../server/@types/user-defined'

export default class DateComponent {
  constructor(private readonly idPrefix: string) {}

  clear() {
    this.getInput('day').clear()
    this.getInput('month').clear()
    this.getInput('year').clear()
  }

  shouldHaveValue(date: StructuredDate) {
    this.getInput('day').should('have.value', date.day)
    this.getInput('month').should('have.value', date.month)
    this.getInput('year').should('have.value', date.year)
  }

  private getInput(datePart: 'day' | 'month' | 'year') {
    return cy.get(`#${this.idPrefix}-${datePart}`)
  }
}
