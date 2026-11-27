import { Locator, Page } from '@playwright/test'

export default class DatePickerComponent {
  readonly datePickerButton: Locator

  readonly dateFieldLocator: Locator

  constructor(readonly page: Page) {
    this.datePickerButton = page.getByRole('button', { name: 'Choose date' })
    this.dateFieldLocator = page.locator('input[name="date"]')
  }

  async openDatePicker() {
    await this.datePickerButton.click()
  }

  async selectTodaysDate() {
    await this.page.getByRole('button', { name: 'Select' }).click()
  }

  async enterDate(date: Date) {
    const ukDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London' }).format(date)
    await this.dateFieldLocator.fill(ukDate)
  }
}
