export default class DataTableComponent {
  shouldHaveRowsWithContent(rowData: Array<Array<string | number>>) {
    rowData.forEach((row: Array<string>, rowIndex: number) => {
      cy.get('tr')
        .eq(rowIndex + 1)
        .within(() => {
          row.forEach((value: string, i: number) => {
            cy.get('td').eq(i).should('have.text', value)
          })
        })
    })
  }
}
