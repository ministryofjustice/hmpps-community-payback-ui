import { StructuredDate } from '../../../server/@types/user-defined'

export default class DateComponent {
  constructor(private readonly idPrefix: string) {}

  clear() {
    this.getInput('day').clear()
    this.getInput('month').clear()
    this.getInput('year').clear()
  }

  enterDates(day: string, month: string, year: string) {
    this.getInput('day').type(day)
    this.getInput('month').type(month)
    this.getInput('year').type(year)
  }

  shouldHaveValue(date: Omit<StructuredDate, 'formattedDate'>) {
    this.getInput('day').should('have.value', date.day)
    this.getInput('month').should('have.value', date.month)
    this.getInput('year').should('have.value', date.year)
  }

  private getInput(datePart: 'day' | 'month' | 'year') {
    return cy.get(`#${this.idPrefix}-${datePart}`)
  }
}
