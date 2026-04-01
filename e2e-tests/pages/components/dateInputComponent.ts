import { Locator, Page } from '@playwright/test'

export default class DateInputComponent {
  readonly dayFieldLocator: Locator

  readonly monthFieldLocator: Locator

  readonly yearFieldLocator: Locator

  constructor(page: Page) {
    this.dayFieldLocator = page.getByLabel('day')
    this.monthFieldLocator = page.getByLabel('month')
    this.yearFieldLocator = page.getByLabel('year')
  }

  async enterDate(date: Date) {
    await this.dayFieldLocator.fill(date.getDate().toString())
    await this.monthFieldLocator.fill((date.getMonth() + 1).toString().padStart(2, '0'))
    await this.yearFieldLocator.fill(date.getFullYear().toString())
  }
}
