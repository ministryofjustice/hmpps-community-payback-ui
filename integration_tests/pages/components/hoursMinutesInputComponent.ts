export default class HoursMinutesInputComponent {
  enterTime(hours: string = '1', minutes: string = '30') {
    this.hoursInput().type(hours)
    this.minutesInput().type(minutes)
  }

  shouldHaveValue(hours?: string, minutes?: string) {
    this.hoursInput().should('have.value', hours)
    this.minutesInput().should('have.value', minutes)
  }

  private hoursInput() {
    return cy.get('#hours')
  }

  private minutesInput() {
    return cy.get('#minutes')
  }

  shouldShowMissingValueError() {
    cy.get(`[data-cy-error-hours]`).should('contain', 'Enter hours and minutes')
  }
}
