import { Locator, Page } from '@playwright/test'

export default class DatePickerComponent {
  readonly datePickerButton: Locator

  constructor(readonly page: Page) {
    this.datePickerButton = page.getByRole('button', { name: 'Choose date' })
  }

  async openDatePicker() {
    await this.datePickerButton.click()
  }

  async selectTodaysDate() {
    await this.page.getByRole('button', { name: 'Select' }).click()
  }
}
