import { Locator, Page } from '@playwright/test'

export default class PduFilterComponent {
  pduSelectLocator: Locator

  filterButtonLocator: Locator

  regionSelectLocator: Locator

  applyButtonLocator: Locator

  constructor(page: Page) {
    this.pduSelectLocator = page.getByLabel('PDU')
    this.regionSelectLocator = page.getByLabel('Region')
    this.filterButtonLocator = page.getByRole('button', { name: 'Apply filters' })
    this.applyButtonLocator = page.getByRole('button', { name: 'Apply', exact: true })
  }

  async selectPdu(label: string) {
    await this.pduSelectLocator.selectOption({ label })
  }

  async selectRegion(label: string) {
    await this.regionSelectLocator.selectOption({ label })
  }

  async submitForm() {
    await this.filterButtonLocator.click()
  }
}
