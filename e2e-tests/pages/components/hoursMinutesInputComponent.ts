import { Locator, Page } from '@playwright/test'

export default class HoursMinutesInputComponent {
  hoursFieldLocator: Locator

  minutesFieldLocator: Locator

  constructor(page: Page, exact = false) {
    this.hoursFieldLocator = page.getByLabel('Hours', { exact })
    this.minutesFieldLocator = page.getByLabel('Minutes', { exact })
  }

  async enterHours(hours: string, minutes: string) {
    await this.hoursFieldLocator.fill(hours)
    await this.minutesFieldLocator.fill(minutes)
  }
}
