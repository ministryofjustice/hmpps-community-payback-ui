import { Locator, Page } from '@playwright/test'

export default class BasePage {
  readonly headingLocator: Locator

  constructor(readonly page: Page) {
    this.headingLocator = page.getByRole('heading', { level: 1 })
  }

  async clickBack() {
    await this.page.getByRole('link', { name: 'Back', exact: true }).click()
  }
}
