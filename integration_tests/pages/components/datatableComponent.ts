export default class DataTableComponent {
  private readonly locator = 'table'

  constructor(private readonly identifier: string = undefined) {}

  private component() {
    return this.identifier ? cy.get(this.locator).filter(`:contains(${this.identifier})`) : cy.get(this.locator)
  }

  shouldHaveRowsWithContent(rowData: Array<Array<string | number>>) {
    rowData.forEach((row: Array<string>, rowIndex: number) => {
      this.component()
        .find('tr')
        .eq(rowIndex + 1)
        .within(() => {
          row.forEach((value: string, i: number) => {
            cy.get('td').eq(i).should('have.text', value)
          })
        })
    })
  }

  shouldShowPaginationControls() {
    cy.get('.govuk-pagination').should('exist')
  }
}
