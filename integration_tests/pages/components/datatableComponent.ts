export default class DataTableComponent {
  shouldHaveRows<T>(data: Array<T>, verifyRow: (rowData: T) => void) {
    data.forEach((rowData, i) => {
      cy.get('tr')
        .eq(i + 1)
        .within(() => {
          verifyRow(rowData)
        })
    })
  }
}
