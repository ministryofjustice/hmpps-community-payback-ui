import { Locator, Page } from '@playwright/test'

export default class HoursMinutesInputComponent {
  hoursFieldLocator: Locator

  minutesFieldLocator: Locator

  constructor(page: Page) {
    this.hoursFieldLocator = page.getByLabel('Hours')
    this.minutesFieldLocator = page.getByLabel('Minutes')
  }

  async enterHours(hours: string, minutes: string) {
    await this.hoursFieldLocator.fill(hours)
    await this.minutesFieldLocator.fill(minutes)
  }
}
